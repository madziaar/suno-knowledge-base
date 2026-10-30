/**
 * Batch scheduling for the Phase-4 tools.
 *
 * The extension never fires 200 requests at once: it plans batches with a fixed
 * concurrency and a gap between them, and backs off exponentially when the site
 * pushes back. Planning is pure and testable; the loop that consumes a plan
 * lives in the background worker.
 */

export interface BatchPlanOptions {
  /** Requests in flight at once. Default 3 — polite, not a stampede. */
  readonly concurrency?: number;
  /** Idle gap between batches, in milliseconds. Default 750. */
  readonly gapMs?: number;
  /** Hard ceiling on items per plan. */
  readonly limit?: number;
}

export interface Batch {
  readonly index: number;
  readonly startsAtMs: number;
  readonly items: readonly string[];
}

export interface BatchPlan {
  readonly batches: readonly Batch[];
  readonly concurrency: number;
  readonly gapMs: number;
  readonly itemCount: number;
  /** Items dropped because the plan hit its limit. */
  readonly dropped: number;
  /** Wall-clock estimate excluding network latency. */
  readonly estimatedMs: number;
}

export const DEFAULT_CONCURRENCY = 3;
export const DEFAULT_GAP_MS = 750;
export const DEFAULT_LIMIT = 500;

function positiveInt(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const width = positiveInt(size, 1);
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += width) out.push(items.slice(index, index + width));
  return out;
}

export function planBatches(items: readonly string[], options: BatchPlanOptions = {}): BatchPlan {
  const concurrency = positiveInt(options.concurrency, DEFAULT_CONCURRENCY);
  const gapMs = positiveInt(options.gapMs, DEFAULT_GAP_MS);
  const limit = positiveInt(options.limit, DEFAULT_LIMIT);

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const raw of items) {
    const value = (raw ?? '').trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    unique.push(value);
  }

  const kept = unique.slice(0, limit);
  const batches: Batch[] = chunk(kept, concurrency).map((group, index) => ({
    index,
    startsAtMs: index * gapMs,
    items: group,
  }));
  const lastStart = batches.length > 0 ? (batches[batches.length - 1]?.startsAtMs ?? 0) : 0;

  return {
    batches,
    concurrency,
    gapMs,
    itemCount: kept.length,
    dropped: unique.length - kept.length,
    estimatedMs: batches.length === 0 ? 0 : lastStart + gapMs,
  };
}

/** 500 ms, 1 s, 2 s, 4 s … capped. */
export function retryDelay(attempt: number, baseMs = 500, capMs = 8000): number {
  const step = Math.max(0, Math.floor(attempt));
  return Math.min(capMs, Math.max(baseMs, baseMs * 2 ** step));
}

/** 429, 408 and 5xx are worth retrying. 404 never is. */
export function isRetryableStatus(status: number): boolean {
  if (!Number.isFinite(status)) return false;
  return status === 429 || status === 408 || (status >= 500 && status <= 599);
}

export function hasBudget(plan: BatchPlan, elapsedMs: number, budgetMs: number): boolean {
  if (plan.batches.length === 0) return false;
  const spent = Math.max(0, elapsedMs);
  const remaining = budgetMs - spent;
  const nextStart = plan.batches.find((batch) => batch.startsAtMs >= spent);
  return remaining > 0 && nextStart !== undefined;
}
