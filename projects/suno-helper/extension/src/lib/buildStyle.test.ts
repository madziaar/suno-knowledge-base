import { describe, expect, it } from 'vitest';

import {
  EMPTY_STYLE_STATE,
  PILLARS,
  auditStyle,
  buildStyle,
  isComplete,
  missingPillars,
  mulberry32,
  rollStyle,
  styleChars,
  toggleLock,
  type StyleState,
} from './buildStyle';

function full(seed = 1): StyleState {
  return rollStyle(EMPTY_STYLE_STATE, { seed });
}

describe('mulberry32', () => {
  it('is deterministic for a seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('produces values in [0, 1)', () => {
    const rng = mulberry32(7);
    for (let index = 0; index < 100; index += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('differs between seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe('buildStyle', () => {
  it('renders an empty state as an empty string', () => {
    expect(buildStyle(EMPTY_STYLE_STATE)).toBe('');
  });

  it('renders pillars in the declared order', () => {
    const state: StyleState = {
      seed: 1,
      values: { production: ['tape'], vocal: ['baritone'], mood: ['tense'], instrumentation: ['bass'], genre: ['synthwave'] },
      locked: { genre: true, instrumentation: true, mood: true, vocal: true, production: true },
    };
    expect(buildStyle(state)).toBe('synthwave, bass, tense, baritone, tape');
    expect(PILLARS.map((pillar) => pillar.id)).toEqual(['genre', 'instrumentation', 'mood', 'vocal', 'production']);
  });

  it('skips excluded pillars without losing their values', () => {
    const state = full(3);
    const without = buildStyle(state, { exclude: ['mood'] });
    expect(without).not.toBe(buildStyle(state));
    expect(without.split(', ')).toHaveLength(buildStyle(state).split(', ').length - state.values.mood.length);
  });
});

describe('rollStyle', () => {
  it('is reproducible from its seed', () => {
    expect(buildStyle(rollStyle(EMPTY_STYLE_STATE, { seed: 11 }))).toBe(buildStyle(rollStyle(EMPTY_STYLE_STATE, { seed: 11 })));
  });

  it('produces a different string for a different seed', () => {
    const seeds = [1, 2, 3, 4, 5];
    const rendered = seeds.map((seed) => buildStyle(rollStyle(EMPTY_STYLE_STATE, { seed })));
    expect(new Set(rendered).size).toBeGreaterThan(1);
  });

  it('keeps locked pillars untouched', () => {
    const base = full(5);
    const locked = toggleLock(base, 'genre');
    const rerolled = rollStyle(locked, { seed: 99 });
    expect(rerolled.values.genre).toEqual(base.values.genre);
    expect(rerolled.locked.genre).toBe(true);
  });

  it('bumps the seed when none is given', () => {
    const next = rollStyle(EMPTY_STYLE_STATE);
    expect(next.seed).toBe(EMPTY_STYLE_STATE.seed + 1);
  });

  it('respects a per-pillar pick count', () => {
    const state = rollStyle(EMPTY_STYLE_STATE, { seed: 2, pick: { instrumentation: 3, genre: 2 } });
    expect(state.values.instrumentation).toHaveLength(3);
    expect(state.values.genre).toHaveLength(2);
  });

  it('does not mutate the input state', () => {
    const base = full(4);
    const snapshot = JSON.stringify(base);
    rollStyle(base, { seed: 77 });
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});

describe('toggleLock', () => {
  it('flips one pillar and leaves the rest alone', () => {
    const state = toggleLock(EMPTY_STYLE_STATE, 'mood');
    expect(state.locked.mood).toBe(true);
    expect(state.locked.genre).toBe(false);
    expect(toggleLock(state, 'mood').locked.mood).toBe(false);
  });

  it('returns a new object', () => {
    expect(toggleLock(EMPTY_STYLE_STATE, 'genre')).not.toBe(EMPTY_STYLE_STATE);
  });
});

describe('completeness', () => {
  it('reports every missing pillar on an empty state', () => {
    expect(missingPillars(EMPTY_STYLE_STATE)).toEqual(['genre', 'instrumentation', 'mood', 'vocal', 'production']);
    expect(isComplete(EMPTY_STYLE_STATE)).toBe(false);
  });

  it('is complete after a roll', () => {
    expect(isComplete(full(8))).toBe(true);
    expect(missingPillars(full(8))).toEqual([]);
  });
});

describe('auditStyle', () => {
  it('flags empty, thin, ok and crowded pillars', () => {
    const state: StyleState = {
      seed: 1,
      values: {
        genre: ['indie pop'],
        instrumentation: ['bass'],
        mood: ['a', 'b', 'c', 'd'],
        vocal: [],
        production: ['tape', 'wide reverb'],
      },
      locked: { genre: false, instrumentation: false, mood: false, vocal: false, production: false },
    };
    const byId = Object.fromEntries(auditStyle(state).map((entry) => [entry.pillar, entry.status]));
    expect(byId.genre).toBe('ok');
    expect(byId.instrumentation).toBe('thin');
    expect(byId.mood).toBe('crowded');
    expect(byId.vocal).toBe('empty');
    expect(byId.production).toBe('ok');
  });

  it('returns one audit entry per pillar', () => {
    expect(auditStyle(EMPTY_STYLE_STATE)).toHaveLength(PILLARS.length);
  });
});

describe('styleChars', () => {
  it('counts the rendered string, not the state', () => {
    const state = full(6);
    expect(styleChars(state)).toBe(buildStyle(state).length);
  });
});
