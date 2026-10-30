import { describe, expect, it } from 'vitest';

import { HYPE_WORDS, cleanStyle, explainClean } from './cleanStyle';

describe('cleanStyle', () => {
  it('splits, dedupes and rejoins with commas', () => {
    const result = cleanStyle('indie pop; dreamy | reverb guitars, dreamy');
    expect(result.value).toBe('indie pop, dreamy, reverb guitars');
    expect(result.duplicates).toEqual(['dreamy']);
  });

  it('drops hype words and reports them with their original casing', () => {
    const result = cleanStyle('Epic indie pop, amazing vocals, legendary');
    expect(result.value).toBe('indie pop, vocals');
    expect(result.removed).toEqual(['Epic', 'amazing', 'legendary']);
  });

  it('can keep hype words when asked', () => {
    expect(cleanStyle('epic indie pop', { dropHype: false }).value).toBe('epic indie pop');
  });

  it('lowercases only on request', () => {
    expect(cleanStyle('Indie Pop').value).toBe('Indie Pop');
    expect(cleanStyle('Indie Pop', { lowercase: true }).value).toBe('indie pop');
  });

  it('caps the tag count and says which tags were dropped', () => {
    const result = cleanStyle('a, b, c, d, e', { maxTags: 3 });
    expect(result.tags).toEqual(['a', 'b', 'c']);
    expect(result.droppedOverLimit).toEqual(['d', 'e']);
  });

  it('flags an over-budget result instead of truncating it', () => {
    const result = cleanStyle('one, two, three', { maxChars: 5 });
    expect(result.value).toBe('one, two, three');
    expect(result.overBudget).toBe(true);
    expect(result.chars).toBe(15);
  });

  it('is idempotent', () => {
    const once = cleanStyle('Epic  indie pop,;  dreamy, dreamy, amazing ');
    const twice = cleanStyle(once.value);
    expect(twice.value).toBe(once.value);
    expect(twice.removed).toEqual([]);
  });

  it('returns an empty string for a blob of hype', () => {
    const result = cleanStyle('epic, amazing, legendary');
    expect(result.value).toBe('');
    expect(result.tags).toEqual([]);
    expect(result.removed).toHaveLength(3);
  });

  it('preserves non-latin scripts', () => {
    expect(cleanStyle('шугейз, 梦幻流行').value).toBe('шугейз, 梦幻流行');
  });

  it('handles empty and whitespace input', () => {
    expect(cleanStyle('').value).toBe('');
    expect(cleanStyle('   ,  ; ').value).toBe('');
  });

  it('keeps the hype list free of genres and instruments', () => {
    for (const word of ['rock', 'jazz', 'guitar', 'piano', 'dreamy']) {
      expect(HYPE_WORDS.map((item) => item.toLowerCase())).not.toContain(word);
    }
  });
});

describe('explainClean', () => {
  it('summarises removals', () => {
    const result = cleanStyle('epic indie, indie, a, b', { maxTags: 2 });
    expect(explainClean(result)).toContain('1 hype word');
    expect(explainClean(result)).toContain('1 duplicate');
  });

  it('says so when nothing happened', () => {
    expect(explainClean(cleanStyle('indie pop'))).toBe('Already clean — nothing removed.');
  });
});
