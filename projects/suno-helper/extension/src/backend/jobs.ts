/**
 * Batch job state machine (background worker).
 *
 * Pure functions over plain objects: the service worker owns the timers and the
 * fetch calls, this module owns the rules. Keeping it pure means the awkward
 * parts — partial failure, retry budgets, ordering — are testable in node.
 */

import { isRetryableStatus, retryDelay } from '../lib/batchPlan';
import type { SongRef } from '../lib/parseLinks';

export type ItemStatus = 'queued' | 'running' | 'done' | 'failed' | 'skipped' | 'manual';

export interface JobItem {
  readonly ref: SongRef;
  status: ItemStatus;
  attempts: number;
  /** When the next attempt may start (ms since epoch). */
  nextAttemptAt: number;
  error: string;
  captureId: string;
}

export interface Job {
  readonly id: string;
  readonly createdAt: number;
  readonly concurrency: number;
  readonly gapMs: number;
  readonly maxAttempts: number;
  items: JobItem[];
  /** Last time a batch was dispatched (ms since epoch). */
  lastDispatchAt: number;
}

export interface JobOptions {
  readonly now?: number;
  readonly concurrency?: number;
  readonly gapMs?: number;
  readonly maxAttempts?: number;
  readonly limit?: number;
}

export interface JobStats {
  readonly total: number;
  readonly queued: number;
  readonly running: number;
  readonly done: number;
  readonly failed: number;
  readonly skipped: number;
  readonly manual: number;
  readonly settled: number;
  readonly complete: boolean;
}

let counter = 0;

export function createJob(refs: readonly SongRef[], options: JobOptions = {}): Job {
  const now = options.now ?? Date.now();
  const limit = Math.max(1, Math.floor(options.limit ?? 500));
  counter += 1;
  return {
    id: `job-${now.toString(36)}-${counter}`,
    createdAt: now,
    concurrency: Math.max(1, Math.floor(options.concurrency ?? 3)),
    gapMs: Math.max(0, Math.floor(options.gapMs ?? 750)),
    maxAttempts: Math.max(1, Math.floor(options.maxAttempts ?? 3)),
    lastDispatchAt: 0,
    items: refs.slice(0, limit).map((ref) => ({
      ref,
      status: ref.kind === 'song' ? 'queued' : 'manual',
      attempts: 0,
      nextAttemptAt: now,
      error: '',
      captureId: '',
    })),
  };
}

/** Items that may start now: queued, due, and within the concurrency window. */
export function nextDispatch(job: Job, now: number = Date.now()): JobItem[] {
  const running = job.items.filter((item) => item.status === 'running').length;
  const slots = Math.max(0, job.concurrency - running);
  if (slots === 0) return [];
  if (job.lastDispatchAt > 0 && now - job.lastDispatchAt < job.gapMs) return [];
  return job.items
    .filter((item) => item.status === 'queued' && item.nextAttemptAt <= now)
    .slice(0, slots);
}

export function markRunning(job: Job, item: JobItem, now: number = Date.now()): Job {
  item.status = 'running';
  item.attempts += 1;
  job.lastDispatchAt = now;
  return job;
}

export interface ItemOutcome {
  readonly ok: boolean;
  readonly status?: number;
  readonly captureId?: string;
  readonly error?: string;
}

/** Record an outcome: done, retry (with backoff), or terminal failure. */
export function applyOutcome(job: Job, item: JobItem, outcome: ItemOutcome, now: number = Date.now()): Job {
  if (outcome.ok) {
    item.status = 'done';
    item.captureId = outcome.captureId ?? '';
    item.error = '';
    return job;
  }
  const retryable = outcome.status === undefined ? true : isRetryableStatus(outcome.status);
  item.error = outcome.error ?? (outcome.status !== undefined ? `HTTP ${outcome.status}` : 'network error');
  if (retryable && item.attempts < job.maxAttempts) {
    item.status = 'queued';
    item.nextAttemptAt = now + retryDelay(item.attempts - 1);
    return job;
  }
  item.status = 'failed';
  return job;
}

export function skipItem(job: Job, item: JobItem, reason: string): Job {
  item.status = 'skipped';
  item.error = reason;
  return job;
}

export function jobStats(job: Job): JobStats {
  const count = (status: ItemStatus) => job.items.filter((item) => item.status === status).length;
  const settled = job.items.filter((item) => item.status === 'done' || item.status === 'failed' || item.status === 'skipped' || item.status === 'manual').length;
  return {
    total: job.items.length,
    queued: count('queued'),
    running: count('running'),
    done: count('done'),
    failed: count('failed'),
    skipped: count('skipped'),
    manual: count('manual'),
    settled,
    complete: settled === job.items.length,
  };
}

/** Should the worker schedule another tick? */
export function shouldContinue(job: Job): boolean {
  const stats = jobStats(job);
  return !stats.complete && (stats.queued > 0 || stats.running > 0);
}

/** One-line progress for the popup. */
export function describeJob(job: Job): string {
  const stats = jobStats(job);
  const parts = [`${stats.done}/${stats.total} captured`];
  if (stats.running > 0) parts.push(`${stats.running} running`);
  if (stats.queued > 0) parts.push(`${stats.queued} queued`);
  if (stats.failed > 0) parts.push(`${stats.failed} failed`);
  if (stats.manual > 0) parts.push(`${stats.manual} need a tab`);
  if (stats.skipped > 0) parts.push(`${stats.skipped} skipped`);
  return parts.join(' · ');
}
