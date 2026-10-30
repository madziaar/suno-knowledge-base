import { describe, expect, it } from 'vitest';

import { collapseWhitespace, formatClock, slugify, splitTags, titleCase, uniqueCaseInsensitive } from './text';

describe('splitTags', () => {
  it('splits on every separator the tools accept', () => {
    expect(splitTags('indie pop, dreamy; reverb | guitars / 120 BPM')).toEqual([
      'indie pop',
      'dreamy',
      'reverb',
      'guitars',
      '120 BPM',
    ]);
  });

  it('drops empty segments', () => {
    expect(splitTags('a,,b,')).toEqual(['a', 'b']);
    expect(splitTags('')).toEqual([]);
  });
});

describe('collapseWhitespace', () => {
  it('collapses runs and trims', () => {
    expect(collapseWhitespace('  a \n\t b  ')).toBe('a b');
  });
});

describe('uniqueCaseInsensitive', () => {
  it('keeps the first spelling', () => {
    expect(uniqueCaseInsensitive(['Indie Pop', 'indie pop', 'Dreamy'])).toEqual(['Indie Pop', 'Dreamy']);
  });

  it('returns an empty array unchanged', () => {
    expect(uniqueCaseInsensitive([])).toEqual([]);
  });
});

describe('titleCase and slugify', () => {
  it('capitalises word starts', () => {
    expect(titleCase('night drive')).toBe('Night Drive');
  });

  it('slugifies to a safe filename fragment', () => {
    expect(slugify('  Night Drive (mix 2) ')).toBe('night-drive-mix-2');
    expect(slugify('***')).toBe('');
  });

  it('caps the slug length', () => {
    expect(slugify('a'.repeat(200))).toHaveLength(64);
  });
});

describe('formatClock', () => {
  it('formats under an hour as m:ss', () => {
    expect(formatClock(75)).toBe('1:15');
    expect(formatClock(0)).toBe('0:00');
  });

  it('adds hours only when needed', () => {
    expect(formatClock(3661)).toBe('1:01:01');
  });

  it('clamps negatives', () => {
    expect(formatClock(-5)).toBe('0:00');
  });
});
