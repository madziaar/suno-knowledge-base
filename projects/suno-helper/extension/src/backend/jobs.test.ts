import { describe, expect, it } from 'vitest';

import { applyOutcome, createJob, describeJob, jobStats, markRunning, nextDispatch, shouldContinue, skipItem } from '../backend/jobs';
import type { SongRef } from '../lib/parseLinks';

function refs(count: number): SongRef[] {
  return Array.from({ length: count }, (_, index) => ({
    index,
    kind: 'song' as const,
    id: `id-${index}`,
    canonicalUrl: `https://suno.com/song/id-${index}`,
  }));
}

const T0 = 1_700_000_000_000;

describe('createJob', () => {
  it('queues song refs and marks playlist/profile as manual', () => {
    const job = createJob([...refs(2), { index: 2, kind: 'playlist', id: 'p', canonicalUrl: 'https://suno.com/playlist/p' }], { now: T0 });
    expect(job.items.map((item) => item.status)).toEqual(['queued', 'queued', 'manual']);
    expect(jobStats(job).manual).toBe(1);
  });

  it('applies limits and defaults', () => {
    const job = createJob(refs(10), { now: T0, limit: 4, concurrency: 2, gapMs: 100, maxAttempts: 2 });
    expect(job.items).toHaveLength(4);
    expect(job).toMatchObject({ concurrency: 2, gapMs: 100, maxAttempts: 2 });
  });

  it('generates a unique id', () => {
    expect(createJob(refs(1), { now: T0 }).id).not.toBe(createJob(refs(1), { now: T0 }).id);
  });
});

describe('nextDispatch', () => {
  it('respects concurrency', () => {
    const job = createJob(refs(5), { now: T0, concurrency: 2, gapMs: 0 });
    const batch = nextDispatch(job, T0);
    expect(batch).toHaveLength(2);
    for (const item of batch) markRunning(job, item, T0);
    expect(nextDispatch(job, T0)).toHaveLength(0);
  });

  it('honours the gap between batches', () => {
    const job = createJob(refs(4), { now: T0, concurrency: 1, gapMs: 500 });
    const [first] = nextDispatch(job, T0);
    if (!first) throw new Error('expected an item');
    markRunning(job, first, T0);
    applyOutcome(job, first, { ok: true }, T0 + 400);
    // Slot is free, but the 500 ms gap has not elapsed yet.
    expect(nextDispatch(job, T0 + 400)).toHaveLength(0);
    expect(nextDispatch(job, T0 + 500)).toHaveLength(1);
  });

  it('skips items whose backoff has not elapsed', () => {
    const job = createJob(refs(1), { now: T0, concurrency: 1, gapMs: 0 });
    const [item] = nextDispatch(job, T0);
    if (!item) throw new Error('expected an item');
    markRunning(job, item, T0);
    applyOutcome(job, item, { ok: false, status: 500 }, T0);
    expect(item.status).toBe('queued');
    expect(nextDispatch(job, T0)).toHaveLength(0);
    expect(nextDispatch(job, T0 + 10_000)).toHaveLength(1);
  });

  it('never dispatches manual items', () => {
    const job = createJob([{ index: 0, kind: 'profile', id: '@x', canonicalUrl: 'https://suno.com/@x' }], { now: T0, gapMs: 0 });
    expect(nextDispatch(job, T0)).toHaveLength(0);
  });
});

describe('applyOutcome', () => {
  it('marks a success done with its capture id', () => {
    const job = createJob(refs(1), { now: T0, gapMs: 0 });
    const [item] = nextDispatch(job, T0);
    if (!item) throw new Error('expected an item');
    markRunning(job, item, T0);
    applyOutcome(job, item, { ok: true, captureId: 'cap-1' }, T0);
    expect(item).toMatchObject({ status: 'done', captureId: 'cap-1', attempts: 1 });
  });

  it('retries a 503 with backoff', () => {
    const job = createJob(refs(1), { now: T0, gapMs: 0 });
    const [item] = nextDispatch(job, T0);
    if (!item) throw new Error('expected an item');
    markRunning(job, item, T0);
    applyOutcome(job, item, { ok: false, status: 503 }, T0);
    expect(item.status).toBe('queued');
    expect(item.nextAttemptAt).toBe(T0 + 500);
  });

  it('does not retry a 404', () => {
    const job = createJob(refs(1), { now: T0, gapMs: 0 });
    const [item] = nextDispatch(job, T0);
    if (!item) throw new Error('expected an item');
    markRunning(job, item, T0);
    applyOutcome(job, item, { ok: false, status: 404 }, T0);
    expect(item).toEqual(expect.objectContaining({ status: 'failed', error: 'HTTP 404' }));
  });

  it('gives up after maxAttempts', () => {
    const job = createJob(refs(1), { now: T0, gapMs: 0, maxAttempts: 2 });
    const [item] = nextDispatch(job, T0);
    if (!item) throw new Error('expected an item');
    for (let attempt = 0; attempt < 2; attempt += 1) {
      markRunning(job, item, T0);
      applyOutcome(job, item, { ok: false, status: 500 }, T0);
      item.nextAttemptAt = T0;
    }
    expect(item.status).toBe('failed');
    expect(item.attempts).toBe(2);
  });

  it('treats a network error as retryable', () => {
    const job = createJob(refs(1), { now: T0, gapMs: 0 });
    const [item] = nextDispatch(job, T0);
    if (!item) throw new Error('expected an item');
    markRunning(job, item, T0);
    applyOutcome(job, item, { ok: false, error: 'offline' }, T0);
    expect(item.status).toBe('queued');
    expect(item.error).toBe('offline');
  });
});

describe('progress', () => {
  it('completes when every item is settled', () => {
    const job = createJob([...refs(1), { index: 1, kind: 'playlist', id: 'p', canonicalUrl: 'https://suno.com/playlist/p' }], { now: T0, gapMs: 0 });
    const [item] = nextDispatch(job, T0);
    if (!item) throw new Error('expected an item');
    markRunning(job, item, T0);
    applyOutcome(job, item, { ok: true }, T0);
    expect(jobStats(job).complete).toBe(true);
    expect(shouldContinue(job)).toBe(false);
  });

  it('skipping settles an item', () => {
    const job = createJob(refs(1), { now: T0 });
    const item = job.items[0];
    if (!item) throw new Error('expected an item');
    skipItem(job, item, 'duplicate');
    expect(jobStats(job)).toMatchObject({ skipped: 1, complete: true });
  });

  it('describes progress in one line', () => {
    const job = createJob(refs(3), { now: T0 });
    const [item] = nextDispatch(job, T0);
    if (!item) throw new Error('expected an item');
    markRunning(job, item, T0);
    applyOutcome(job, item, { ok: true }, T0);
    const line = describeJob(job);
    expect(line).toContain('1/3 captured');
    expect(line).toContain('queued');
  });

  it('keeps working while queued items remain', () => {
    const job = createJob(refs(3), { now: T0, concurrency: 1, gapMs: 0 });
    expect(shouldContinue(job)).toBe(true);
  });
});
