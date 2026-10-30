import { describe, expect, it } from 'vitest';

import { diffLyrics, normalizeLines, summarizeDiff } from './diffLyrics';

describe('normalizeLines', () => {
  it('normalises CRLF and trailing whitespace', () => {
    expect(normalizeLines('a  \r\nb\r\n')).toEqual(['a', 'b']);
  });

  it('drops leading and trailing blank lines but keeps inner ones', () => {
    expect(normalizeLines('\n\na\n\nb\n\n')).toEqual(['a', '', 'b']);
  });

  it('handles an empty draft', () => {
    expect(normalizeLines('')).toEqual([]);
    expect(normalizeLines('   \n\n')).toEqual([]);
  });
});

describe('diffLyrics', () => {
  it('reports identical drafts as all equal', () => {
    const result = diffLyrics('[Verse]\nline one\n[Chorus]\nline two', '[Verse]\nline one\n[Chorus]\nline two');
    expect(result.stats).toMatchObject({ equal: 4, added: 0, removed: 0, changed: 0, changedRatio: 0 });
    expect(summarizeDiff(result)).toContain('No changes');
  });

  it('detects an added line', () => {
    const result = diffLyrics('a\nb', 'a\nb\nc');
    expect(result.stats.added).toBe(1);
    expect(result.lines.at(-1)).toMatchObject({ kind: 'add', right: 'c' });
  });

  it('detects a removed line', () => {
    const result = diffLyrics('a\nb\nc', 'a\nc');
    expect(result.stats.removed).toBe(1);
    expect(result.lines.some((line) => line.kind === 'remove' && line.left === 'b')).toBe(true);
  });

  it('pairs a rewrite into a single change', () => {
    const result = diffLyrics('hold the line', 'hold the light');
    expect(result.stats.changed).toBe(1);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toMatchObject({ kind: 'change', left: 'hold the line', right: 'hold the light' });
  });

  it('reports reordering instead of flattening it', () => {
    const result = diffLyrics('a\nb\nc', 'c\na\nb');
    expect(result.stats.equal).toBeLessThan(3);
    expect(result.stats.added + result.stats.removed).toBeGreaterThan(0);
  });

  it('keeps line numbers on both sides', () => {
    const result = diffLyrics('a\nb', 'a\nb\nc');
    const added = result.lines.find((line) => line.kind === 'add');
    expect(added?.rightNo).toBe(3);
  });

  it('treats whitespace-only edits as no change', () => {
    const result = diffLyrics('a\nb', 'a   \nb\t');
    expect(result.stats.changedRatio).toBe(0);
  });

  it('handles two empty drafts', () => {
    const result = diffLyrics('', '');
    expect(result.lines).toEqual([]);
    expect(result.stats.total).toBe(0);
    expect(summarizeDiff(result)).toBe('Both drafts are empty.');
  });

  it('handles one empty draft', () => {
    const result = diffLyrics('', 'a\nb');
    expect(result.stats.added).toBe(2);
    expect(result.stats.changedRatio).toBe(1);
  });

  it('summarises additions, removals and changes', () => {
    const result = diffLyrics('a\nb\nc', 'a\nB\nc\nd');
    const summary = summarizeDiff(result);
    expect(summary).toContain('+');
    expect(summary).toContain('across 4 lines');
  });
});
