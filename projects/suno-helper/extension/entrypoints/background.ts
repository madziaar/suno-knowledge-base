/**
 * Background service worker (Manifest V3).
 *
 * Responsibilities:
 *   - be the single writer of `chrome.storage.local`
 *   - answer popup requests and route "apply this prompt" to the active tab
 *   - run the batch capture queue (the only place that makes a network call)
 *
 * The batch loop fetches **public Suno pages** with `credentials: 'omit'` and
 * reads Open Graph / JSON-LD tags. It never touches a session cookie, never
 * calls a private API, and never stores anything the page did not publish.
 */

import { defineBackground } from 'wxt/sandbox';

import { PromptStore, chromeStorage } from '../src/lib/storage';
import { buildCapture, failedCapture, mergeCaptures, type SongCapture } from '../src/lib/capture';
import { extractSongFromHtml } from '../src/lib/htmlMeta';
import { applyOutcome, createJob, describeJob, jobStats, markRunning, nextDispatch, shouldContinue, type Job } from '../src/backend/jobs';
import { emit, type BatchProgress, type Request, type Response } from '../src/messages';

const JOB_KEY = 'job';
const CAPTURES_KEY = 'captures';
const MAX_CAPTURES = 2000;
const ITEM_TIMEOUT_MS = 12_000;

export default defineBackground(() => {
  // Instantiated inside main(): WXT forbids module-level side effects.
  const store = new PromptStore(chromeStorage());
  const queue = new BatchQueue(chromeStorage());

  chrome.runtime.onInstalled.addListener(async () => {
    const settings = await store.getSettings();
    await store.saveSettings(settings);
  });

  // Resume an interrupted batch: MV3 kills the worker, not the user's intent.
  void queue.resume();

  chrome.runtime.onMessage.addListener((request: Request, sender, sendResponse: (response: Response) => void) => {
    handle(request, sender, store, queue)
      .then(sendResponse)
      .catch((error: unknown) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    return true;
  });
});

async function handle(
  request: Request,
  sender: chrome.runtime.MessageSender,
  store: PromptStore,
  queue: BatchQueue,
): Promise<Response> {
  switch (request.type) {
    case 'ping':
      return { ok: true, data: { version: chrome.runtime.getManifest().version } };

    case 'library:list':
      return { ok: true, data: await store.getLibrary() };

    case 'library:save':
      return { ok: true, data: await store.savePrompt(request.record) };

    case 'library:delete':
      return { ok: true, data: { deleted: await store.deletePrompt(request.id) } };

    case 'settings:get':
      return { ok: true, data: await store.getSettings() };

    case 'settings:save':
      return { ok: true, data: await store.saveSettings(request.patch) };

    case 'page:apply': {
      const tabId = sender.tab?.id ?? (await activeTabId());
      if (tabId === undefined) return { ok: false, error: 'no active tab' };
      await chrome.tabs.sendMessage(tabId, request);
      return { ok: true };
    }

    case 'page:fill': {
      const tabId = await activeTabId();
      if (tabId === undefined) return { ok: false, error: 'no active tab' };
      await chrome.tabs.sendMessage(tabId, request);
      return { ok: true };
    }

    case 'page:capture': {
      const tabId = await activeTabId();
      if (tabId === undefined) return { ok: false, error: 'no active tab' };
      const response = (await chrome.tabs.sendMessage(tabId, request)) as Response | undefined;
      return response ?? { ok: false, error: 'the Suno tab did not answer' };
    }

    case 'batch:start':
      return queue.start(request.refs);

    case 'batch:status':
      return { ok: true, data: queue.snapshot() };

    case 'batch:cancel':
      return queue.cancel();

    case 'captures:list':
      return { ok: true, data: await queue.listCaptures() };

    case 'captures:clear':
      return queue.clear();

    default:
      return { ok: false, error: `unknown request: ${(request as { type?: string }).type ?? '?'}` };
  }
}

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

/**
 * The batch runner.
 *
 * Deliberately single-flight: one job at a time, bounded concurrency, a gap
 * between batches, and exponential backoff on 429/5xx. State is persisted after
 * every item, so closing the popup (or the worker being killed) loses nothing.
 */
class BatchQueue {
  private job: Job | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private captures: SongCapture[] = [];
  private busy = false;

  constructor(private readonly storage: ReturnType<typeof chromeStorage>) {}

  async resume(): Promise<void> {
    const raw = await this.storage.get([JOB_KEY, CAPTURES_KEY]);
    this.captures = normaliseCaptures(raw[CAPTURES_KEY]);
    const stored = raw[JOB_KEY];
    if (stored && typeof stored === 'object') {
      this.job = stored as Job;
      if (shouldContinue(this.job)) this.kick();
    }
  }

  async listCaptures(): Promise<SongCapture[]> {
    if (this.captures.length === 0) {
      const raw = await this.storage.get(CAPTURES_KEY);
      this.captures = normaliseCaptures(raw[CAPTURES_KEY]);
    }
    return this.captures;
  }

  async clear(): Promise<Response> {
    this.captures = [];
    await this.storage.set({ [CAPTURES_KEY]: [] });
    return { ok: true, data: { cleared: true } };
  }

  snapshot(): BatchProgress | null {
    if (!this.job) return null;
    return this.progress(this.job);
  }

  async start(refs: readonly { kind: string; id: string; canonicalUrl: string; index: number }[]): Promise<Response> {
    if (this.job && shouldContinue(this.job)) {
      return { ok: false, error: 'a batch is already running — cancel it first' };
    }
    const typed = refs as unknown as import('../src/lib/parseLinks').SongRef[];
    if (typed.length === 0) return { ok: false, error: 'nothing to capture' };

    this.job = createJob(typed);
    await this.persist();
    this.progress(this.job);
    this.kick();
    return { ok: true, data: this.progress(this.job) };
  }

  async cancel(): Promise<Response> {
    if (!this.job) return { ok: true, data: null };
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.job = null;
    await this.persist();
    return { ok: true, data: { cancelled: true } };
  }

  private kick(): void {
    const job = this.job;
    if (!job || this.busy) return;
    const now = Date.now();
    const items = nextDispatch(job, now);
    if (items.length === 0) {
      if (shouldContinue(job)) {
        this.schedule(250);
      } else {
        this.finish(job);
      }
      return;
    }
    this.busy = true;
    for (const item of items) markRunning(job, item, now);
    void this.persist();
    const running = items.map((item) => this.runItem(job, item));
    void Promise.all(running).finally(() => {
      this.busy = false;
      if (!this.job) return;
      if (shouldContinue(this.job)) this.schedule(this.job.gapMs);
      else this.finish(this.job);
    });
  }

  private schedule(delayMs: number): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.kick();
    }, Math.max(0, delayMs));
  }

  private async runItem(job: Job, item: Job['items'][number]): Promise<void> {
    const url = item.ref.canonicalUrl;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ITEM_TIMEOUT_MS);
      const response = await fetch(url, {
        // Public pages only: no cookies, no credentials, no headers that could
        // identify the user beyond what a logged-out browser sends.
        credentials: 'omit',
        redirect: 'follow',
        signal: controller.signal,
        headers: { Accept: 'text/html,application/xhtml+xml' },
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        applyOutcome(job, item, { ok: false, status: response.status }, Date.now());
        return;
      }
      const html = await response.text();
      const meta = extractSongFromHtml(html, url);
      const capture = meta.found
        ? buildCapture(meta, { kind: item.ref.kind })
        : failedCapture(item.ref.id, url, item.ref.kind, 'page had no readable metadata');
      await this.mergeCapture(capture);
      applyOutcome(job, item, capture.status === 'failed' ? { ok: false, status: 200, error: capture.error } : { ok: true, captureId: capture.id || url }, Date.now());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const capture = failedCapture(item.ref.id, url, item.ref.kind, message);
      await this.mergeCapture(capture);
      applyOutcome(job, item, { ok: false, error: message }, Date.now());
    }
  }

  private async mergeCapture(capture: SongCapture): Promise<void> {
    this.captures = mergeCaptures(this.captures, [capture]).slice(0, MAX_CAPTURES);
    await this.storage.set({ [CAPTURES_KEY]: this.captures });
  }

  private async finish(job: Job): Promise<void> {
    const progress = this.progress(job);
    await this.persist();
    emit({ type: 'batch:done', progress });
    this.job = null;
    await this.persist();
  }

  private async persist(): Promise<void> {
    await this.storage.set({ [JOB_KEY]: this.job });
    if (this.job) emit({ type: 'batch:progress', progress: this.progress(this.job) });
  }

  private progress(job: Job): BatchProgress {
    const stats = jobStats(job);
    const errors = job.items
      .filter((item) => item.status === 'failed' && item.error)
      .slice(0, 20)
      .map((item) => ({ url: item.ref.canonicalUrl, error: item.error }));
    const progress: BatchProgress = {
      jobId: job.id,
      total: stats.total,
      done: stats.done,
      failed: stats.failed,
      queued: stats.queued,
      running: stats.running,
      manual: stats.manual,
      complete: stats.complete,
      errors,
    };
    // `describeJob` is what the popup shows as a one-liner; keep the two in sync.
    void describeJob;
    return progress;
  }
}

function normaliseCaptures(raw: unknown): SongCapture[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is SongCapture => Boolean(item) && typeof item === 'object' && 'url' in (item as object));
}
