import { describe, expect, it } from 'vitest';

import { DEFAULT_CONCURRENCY, chunk, hasBudget, isRetryableStatus, planBatches, retryDelay } from './batchPlan';

describe('chunk', () => {
  it('splits evenly and keeps the remainder', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('falls back to size 1 for nonsense widths', () => {
    expect(chunk([1, 2], 0)).toEqual([[1], [2]]);
    expect(chunk([1, 2], Number.NaN)).toEqual([[1], [2]]);
  });

  it('returns nothing for an empty list', () => {
    expect(chunk([], 3)).toEqual([]);
  });
});

describe('planBatches', () => {
  it('respects concurrency and gaps', () => {
    const plan = planBatches(['a', 'b', 'c', 'd', 'e'], { concurrency: 2, gapMs: 100 });
    expect(plan.batches).toHaveLength(3);
    expect(plan.batches.map((batch) => batch.items)).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
    expect(plan.batches.map((batch) => batch.startsAtMs)).toEqual([0, 100, 200]);
    expect(plan.estimatedMs).toBe(300);
  });

  it('deduplicates and trims before planning', () => {
    const plan = planBatches([' a ', 'a', '', 'b'], { concurrency: 5 });
    expect(plan.itemCount).toBe(2);
    expect(plan.batches[0]?.items).toEqual(['a', 'b']);
  });

  it('caps the plan and reports what it dropped', () => {
    const items = Array.from({ length: 10 }, (_, index) => `item-${index}`);
    const plan = planBatches(items, { limit: 4, concurrency: 2 });
    expect(plan.itemCount).toBe(4);
    expect(plan.dropped).toBe(6);
    expect(plan.batches).toHaveLength(2);
  });

  it('is empty and costs nothing when there is nothing to do', () => {
    const plan = planBatches([]);
    expect(plan.batches).toHaveLength(0);
    expect(plan.estimatedMs).toBe(0);
  });

  it('uses polite defaults', () => {
    const plan = planBatches(['a', 'b', 'c', 'd']);
    expect(plan.concurrency).toBe(DEFAULT_CONCURRENCY);
    expect(plan.batches[0]?.items).toHaveLength(DEFAULT_CONCURRENCY);
  });
});

describe('retry policy', () => {
  it('backs off exponentially and stops at the cap', () => {
    expect([0, 1, 2, 3, 9].map((attempt) => retryDelay(attempt))).toEqual([500, 1000, 2000, 4000, 8000]);
  });

  it('never returns less than the base delay', () => {
    expect(retryDelay(-3)).toBe(500);
  });

  it('retries 429 and 5xx, not 404', () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(408)).toBe(true);
    expect(isRetryableStatus(404)).toBe(false);
    expect(isRetryableStatus(200)).toBe(false);
  });
});

describe('budget', () => {
  it('allows work while time remains', () => {
    const plan = planBatches(['a', 'b', 'c'], { concurrency: 1, gapMs: 100 });
    expect(hasBudget(plan, 0, 1000)).toBe(true);
    expect(hasBudget(plan, 2000, 1000)).toBe(false);
  });

  it('never schedules an empty plan', () => {
    expect(hasBudget(planBatches([]), 0, 1000)).toBe(false);
  });
});
