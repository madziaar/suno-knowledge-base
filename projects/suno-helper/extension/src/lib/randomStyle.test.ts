import { describe, expect, it } from 'vitest';

import { PILLARS, SEED_POOL, generateStyle, mulberry32, nextSeed, shuffle } from './randomStyle';

describe('mulberry32', () => {
  it('is deterministic for a seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('differs across seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it('stays inside [0, 1)', () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 200; i += 1) {
      const value = rand();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('shuffle', () => {
  it('keeps every element', () => {
    const source = [1, 2, 3, 4, 5];
    expect([...shuffle(source, mulberry32(3))].sort()).toEqual(source);
  });

  it('does not mutate the input', () => {
    const source = [1, 2, 3];
    shuffle(source, mulberry32(3));
    expect(source).toEqual([1, 2, 3]);
  });
});

describe('generateStyle', () => {
  it('is reproducible from a seed', () => {
    const first = generateStyle({ seed: 1234 });
    const second = generateStyle({ seed: 1234 });
    expect(second.style).toBe(first.style);
    expect(second.picks).toEqual(first.picks);
  });

  it('changes when the seed changes', () => {
    expect(generateStyle({ seed: 1 }).style).not.toBe(generateStyle({ seed: 2 }).style);
  });

  it('keeps every locked pillar', () => {
    const roll = generateStyle({ seed: 9, locked: { genre: 'dream pop', vocal: 'no vocals' } });
    expect(roll.picks.genre).toBe('dream pop');
    expect(roll.picks.vocal).toBe('no vocals');
    expect(roll.lockedKeys).toEqual(['genre', 'vocal']);
  });

  it('produces a comma-separated string of the pillars', () => {
    const roll = generateStyle({ seed: 5 });
    const parts = roll.style.split(', ');
    expect(parts.length).toBe(PILLARS.filter((pillar) => roll.picks[pillar]).length);
  });

  it('skips pillars whose pool is empty and still returns a style', () => {
    const roll = generateStyle({
      seed: 5,
      pool: { ...SEED_POOL, mood: [], vocal: [] },
    });
    expect(roll.picks.mood).toBeUndefined();
    expect(roll.style.length).toBeGreaterThan(0);
  });

  it('appends user extras to a pool', () => {
    const roll = generateStyle({ seed: 5, extra: { genre: ['my private genre'] }, pool: { ...SEED_POOL, genre: [] } });
    expect(roll.picks.genre).toBe('my private genre');
  });
});

describe('nextSeed', () => {
  it('moves away from the current seed', () => {
    expect(nextSeed(10)).not.toBe(10);
    expect(nextSeed(10)).toBe(nextSeed(10));
  });
});
