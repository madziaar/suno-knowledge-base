import { describe, expect, it } from 'vitest';

import { EXCLUDE_CATEGORIES, EXCLUDE_LIMIT, buildExclude, suggestFor } from './excludeStyles';

describe('buildExclude', () => {
  it('joins items with commas', () => {
    expect(buildExclude(['autotune', 'banjo']).value).toBe('autotune, banjo');
  });

  it('deduplicates case-insensitively', () => {
    const result = buildExclude(['Autotune', 'autotune']);
    expect(result.items).toEqual(['Autotune']);
  });

  it('ignores empty entries', () => {
    expect(buildExclude(['', '  ', 'autotune']).items).toEqual(['autotune']);
  });

  it('returns empty for no selection', () => {
    const result = buildExclude([]);
    expect(result).toMatchObject({ value: '', chars: 0, overBudget: false, dropped: [] });
  });

  it('trims to the budget and reports what did not fit', () => {
    const items = Array.from({ length: 40 }, (_, index) => `item-number-${index}`);
    const result = buildExclude(items, 100);
    expect(result.chars).toBeLessThanOrEqual(100);
    expect(result.overBudget).toBe(true);
    expect(result.dropped.length).toBeGreaterThan(0);
    expect(result.items.length + result.dropped.length).toBe(40);
  });

  it('uses the documented default limit', () => {
    expect(EXCLUDE_LIMIT).toBe(1000);
  });
});

describe('suggestFor', () => {
  it('suggests production problems for lo-fi', () => {
    expect(suggestFor('lo-fi chill')).toContain('lo-fi hiss');
  });

  it('suggests genre bleed for pop', () => {
    expect(suggestFor('pop')).toContain('country');
  });

  it('always returns something', () => {
    expect(suggestFor('polka').length).toBeGreaterThan(0);
  });

  it('is deterministic', () => {
    expect(suggestFor('metal')).toEqual(suggestFor('metal'));
  });
});

describe('categories', () => {
  it('has unique ids and non-empty items', () => {
    const ids = EXCLUDE_CATEGORIES.map((category) => category.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const category of EXCLUDE_CATEGORIES) {
      expect(category.items.length).toBeGreaterThan(0);
      expect(category.label.length).toBeGreaterThan(0);
    }
  });
});
