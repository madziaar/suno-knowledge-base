import { describe, expect, it } from 'vitest';

import {
  CANONICAL_TAGS,
  inferMissingStructure,
  lookup,
  normalizeTags,
  parseTagLine,
  tagStats,
} from './normalizeTags';

describe('parseTagLine', () => {
  it('parses a square-bracket tag', () => {
    expect(parseTagLine('[Verse]')).toMatchObject({ raw: 'Verse', canonical: 'Verse', start: 0 });
  });

  it('parses nested brackets as one tag', () => {
    const parsed = parseTagLine('[Verse (quiet)]');
    expect(parsed?.raw).toBe('Verse (quiet)');
    expect(parsed?.canonical).toBe('Verse');
  });

  it('parses lenticular and fullwidth brackets', () => {
    expect(parseTagLine('【副歌】')?.canonical).toBe('Chorus');
    expect(parseTagLine('（主歌）')?.canonical).toBe('Verse');
  });

  it('returns null for prose', () => {
    expect(parseTagLine('just a lyric line')).toBeNull();
  });

  it('returns null for an unbalanced bracket', () => {
    expect(parseTagLine('[Verse')).toBeNull();
  });

  it('returns null for empty brackets', () => {
    expect(parseTagLine('[]')).toBeNull();
  });

  it('captures a performance hint', () => {
    expect(parseTagLine('[Chorus - whispered]')).toMatchObject({ canonical: 'Chorus', hint: 'whispered' });
  });
});

describe('lookup', () => {
  it('maps english aliases and numbered verses', () => {
    expect(lookup('verse 2')).toBe('Verse');
    expect(lookup('pre chorus')).toBe('Pre-Chorus');
    expect(lookup('REFRAIN')).toBe('Chorus');
  });

  it('maps romance languages', () => {
    expect(lookup('estribillo')).toBe('Chorus');
    expect(lookup('couplet')).toBe('Verse');
    expect(lookup('refrão')).toBe('Chorus');
    expect(lookup('puente')).toBe('Bridge');
  });

  it('maps slavic and CJK tags', () => {
    expect(lookup('припев')).toBe('Chorus');
    expect(lookup('куплет')).toBe('Verse');
    expect(lookup('サビ')).toBe('Chorus');
    expect(lookup('前奏')).toBe('Intro');
  });

  it('returns null for unknown tags', () => {
    expect(lookup('kazoo break')).toBeNull();
  });
});

describe('normalizeTags', () => {
  it('rewrites aliases and bracket styles', () => {
    const result = normalizeTags('(couplet)\nune ligne\n【副歌】\nune autre');
    expect(result.value).toBe('[Verse]\nune ligne\n[Chorus]\nune autre');
    expect(result.changed).toBe(2);
    expect(result.issues.every((issue) => issue.line > 0)).toBe(true);
  });

  it('normalises casing and numbering', () => {
    expect(normalizeTags('[VERSE 1]\nline').value).toBe('[Verse]\nline');
    expect(normalizeTags('[chorus]\nline').value).toBe('[Chorus]\nline');
  });

  it('keeps unknown tags verbatim and reports them', () => {
    const result = normalizeTags('[Kazoo Break]\nline');
    expect(result.value).toBe('[Kazoo Break]\nline');
    expect(result.unknowns).toEqual(['Kazoo Break']);
  });

  it('leaves prose lines untouched', () => {
    expect(normalizeTags('no tags here\njust words').value).toBe('no tags here\njust words');
  });

  it('honours a bracket preference', () => {
    expect(normalizeTags('[Chorus]\nx', { brackets: ['【', '】'] }).value).toBe('【Chorus】\nx');
  });

  it('is idempotent', () => {
    const once = normalizeTags('(couplet)\nline').value;
    expect(normalizeTags(once).value).toBe(once);
  });

  it('dry-run reports without rewriting', () => {
    const result = normalizeTags('(couplet)\nline', { dryRun: true });
    expect(result.value).toBe('(couplet)\nline');
    expect(result.changed).toBe(1);
  });

  it('keeps the lyric text after the tag', () => {
    expect(normalizeTags('[verse] hold on').value).toBe('[Verse] hold on');
  });

  it('exposes the canonical tag list', () => {
    expect(CANONICAL_TAGS).toContain('Chorus');
    expect(CANONICAL_TAGS).toContain('Pre-Chorus');
  });
});

describe('inferMissingStructure', () => {
  it('adds verse and chorus markers around the repeated line', () => {
    const input = 'first line\nchorus line\nsecond line\nchorus line';
    const result = inferMissingStructure(input);
    expect(result.changed).toBeGreaterThan(0);
    expect(result.value).toContain('[Chorus]');
    expect(result.value).toContain('[Verse]');
  });

  it('does nothing when the draft already has tags', () => {
    const input = '[Verse]\na\n[Chorus]\nb';
    expect(inferMissingStructure(input)).toEqual({ value: input, changed: 0 });
  });

  it('does nothing without repetition', () => {
    const input = 'one\ntwo\nthree';
    expect(inferMissingStructure(input).changed).toBe(0);
  });
});

describe('tagStats', () => {
  it('counts canonical tags', () => {
    const stats = tagStats('[Verse]\na\n[Chorus]\nb\n(verse)\nc\n[Unknown]');
    expect(stats.counts.Verse).toBe(2);
    expect(stats.counts.Chorus).toBe(1);
    expect(stats.total).toBe(3);
    expect(stats.unknown).toBe(1);
    expect(stats.hasChorus).toBe(true);
  });

  it('reports no chorus when there is none', () => {
    expect(tagStats('[Verse]\na').hasChorus).toBe(false);
  });

  it('handles empty input', () => {
    expect(tagStats('')).toMatchObject({ total: 0, unknown: 0 });
  });
});
