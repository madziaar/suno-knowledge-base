import { describe, expect, it } from 'vitest';

import {
  SEED_STYLES,
  allStyles,
  removeStyle,
  searchStyles,
  stylesCsv,
  upsertStyle,
  userStyleId,
} from './styleLibrary';
import type { StyleEntry } from './styleLibrary';

const mine: StyleEntry = {
  id: 'user-mine',
  name: 'Mine',
  style: 'dream pop, no vocals',
  tags: ['dreamy'],
  source: 'user',
};

describe('searchStyles', () => {
  it('returns everything for an empty query', () => {
    expect(searchStyles(SEED_STYLES, '')).toHaveLength(SEED_STYLES.length);
  });

  it('matches on tags', () => {
    const results = searchStyles(SEED_STYLES, 'lofi');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.tags).toContain('lofi');
  });

  it('matches on the style string', () => {
    const results = searchStyles(SEED_STYLES, 'pedal steel');
    expect(results.some((entry) => entry.name === 'Front porch')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(searchStyles(SEED_STYLES, 'ROCK')).toEqual(searchStyles(SEED_STYLES, 'rock'));
  });

  it('returns nothing for a miss', () => {
    expect(searchStyles(SEED_STYLES, 'zzzzz')).toEqual([]);
  });

  it('ignores one-character noise', () => {
    expect(searchStyles(SEED_STYLES, 'a')).toHaveLength(SEED_STYLES.length);
  });
});

describe('upsertStyle', () => {
  it('adds a new entry at the front', () => {
    expect(upsertStyle(SEED_STYLES, mine)[0]).toEqual(mine);
  });

  it('replaces an entry with the same id', () => {
    const updated = { ...mine, style: 'changed' };
    const out = upsertStyle(upsertStyle(SEED_STYLES, mine), updated);
    expect(out.filter((entry) => entry.id === mine.id)).toHaveLength(1);
    expect(out[0]!.style).toBe('changed');
  });
});

describe('removeStyle', () => {
  it('drops by id', () => {
    expect(removeStyle(upsertStyle(SEED_STYLES, mine), mine.id).some((entry) => entry.id === mine.id)).toBe(false);
  });
});

describe('userStyleId', () => {
  it('derives a stable id from the name', () => {
    expect(userStyleId('My Style')).toBe('user-my-style');
    expect(userStyleId('My  Style!')).toBe(userStyleId('my style'));
  });

  it('never returns an empty suffix', () => {
    expect(userStyleId('!!!')).toMatch(/^user-[a-z0-9]+$/);
  });
});

describe('allStyles', () => {
  it('puts user entries before the seed', () => {
    expect(allStyles([mine])[0]).toEqual(mine);
    expect(allStyles([mine])).toHaveLength(SEED_STYLES.length + 1);
  });
});

describe('stylesCsv', () => {
  it('escapes commas and quotes', () => {
    const csv = stylesCsv([{ ...mine, name: 'A, "B"' }]);
    expect(csv.split('\n')[0]).toBe('name,style,tags,source');
    expect(csv).toContain('"A, ""B"""');
  });
});
