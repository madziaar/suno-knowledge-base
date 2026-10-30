import { describe, expect, it } from 'vitest';

import { canonicalUrl, parseLinks, summarizeLinks } from './parseLinks';

const SONG = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const OTHER = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';

describe('parseLinks', () => {
  it('accepts the URL shapes a user actually pastes', () => {
    const result = parseLinks(
      [
        `https://suno.com/song/${SONG}`,
        `https://app.suno.com/song/${OTHER}?sh=abc123`,
        `www.suno.com/playlist/${SONG}/`,
        'https://suno.com/@night-driver',
        '9f8e7d6c-5b4a-4392-8170-6f5e4d3c2b1a',
      ].join('\n'),
    );

    expect(result.refs).toHaveLength(5);
    expect(result.refs.map((ref) => ref.kind)).toEqual(['song', 'song', 'playlist', 'profile', 'song']);
    expect(result.invalid).toHaveLength(0);
    expect(result.refs[3]?.canonicalUrl).toBe('https://suno.com/@night-driver');
  });

  it('keeps the first occurrence and reports duplicates', () => {
    const result = parseLinks(`${SONG}\nhttps://suno.com/song/${SONG.toUpperCase()}\n${SONG}`);
    expect(result.refs).toHaveLength(1);
    expect(result.duplicates).toHaveLength(2);
  });

  it('preserves input order', () => {
    const result = parseLinks(`${OTHER}\n${SONG}`);
    expect(result.refs.map((ref) => ref.id)).toEqual([OTHER, SONG]);
  });

  it('lowercases ids so casing never duplicates a song', () => {
    const result = parseLinks(`https://suno.com/song/${SONG.toUpperCase()}`);
    expect(result.refs[0]?.id).toBe(SONG);
    expect(result.refs[0]?.canonicalUrl).toBe(`https://suno.com/song/${SONG}`);
  });

  it('explains why a line was rejected', () => {
    const result = parseLinks(
      ['https://example.com/song/abc', 'https://suno.com/song/not-a-uuid', 'hello there', 'https://suno.com/song'].join('\n'),
    );
    expect(result.refs).toHaveLength(0);
    expect(result.invalid.map((entry) => entry.reason)).toEqual([
      'not a suno.com host (example.com)',
      '/song id is not a uuid',
      'not a URL or a song id',
      '/song without an id',
    ]);
  });

  it('strips punctuation from markdown and chat exports', () => {
    expect(parseLinks(`[link](https://suno.com/song/${SONG}),`)?.refs?.[0]?.id ?? parseLinks(`[link](https://suno.com/song/${SONG}),`).refs[0]?.id).toBe(SONG);
    expect(parseLinks(`<https://suno.com/song/${OTHER}>`).refs[0]?.id).toBe(OTHER);
  });

  it('rejects a playlist without an id', () => {
    expect(parseLinks('https://suno.com/playlist').invalid[0]?.reason).toBe('/playlist without an id');
  });

  it('rejects an unrecognised suno path', () => {
    expect(parseLinks('https://suno.com/settings/billing').invalid[0]?.reason).toContain('unrecognised suno path');
  });

  it('rejects a bare host', () => {
    expect(parseLinks('https://suno.com').invalid[0]?.reason).toContain('host root');
  });

  it('ignores blank lines and counts only real entries', () => {
    const result = parseLinks(`\n\n${SONG}\n\n   \n`);
    expect(result.total).toBe(1);
    expect(result.refs).toHaveLength(1);
  });

  it('treats an empty paste as an empty result', () => {
    expect(parseLinks('')).toEqual({ refs: [], invalid: [], duplicates: [], total: 0 });
  });

  it('builds canonical urls per kind', () => {
    expect(canonicalUrl('song', 'x')).toBe('https://suno.com/song/x');
    expect(canonicalUrl('playlist', 'x')).toBe('https://suno.com/playlist/x');
    expect(canonicalUrl('profile', '@x')).toBe('https://suno.com/@x');
  });

  it('summarises the parse in one line', () => {
    const result = parseLinks(`${SONG}\n${SONG}\nnope\nhttps://suno.com/@someone`);
    expect(summarizeLinks(result)).toBe('1 song, 0 playlists, 1 profile — 1 duplicate skipped, 1 line could not be read');
  });
});
