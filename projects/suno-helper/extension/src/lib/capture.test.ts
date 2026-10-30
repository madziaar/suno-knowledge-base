import { describe, expect, it } from 'vitest';

import { buildCapture, captureScore, captureStats, failedCapture, mergeCaptures, toCaptureRows } from './capture';
import type { SongMeta } from './htmlMeta';

const SONG = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

const richMeta: SongMeta = {
  url: `https://suno.com/song/${SONG}`,
  id: SONG,
  title: 'Night Drive',
  creator: 'nightrider',
  description: 'indie pop',
  imageUrl: 'https://cdn1.suno.ai/i.png',
  audioUrl: 'https://cdn1.suno.ai/a.mp3',
  durationSeconds: 192,
  publishedAt: '2026-03-01',
  tags: ['indie pop'],
  source: 'jsonld',
  found: true,
};

const thinMeta: SongMeta = { ...richMeta, creator: '', audioUrl: '', durationSeconds: null, imageUrl: '', tags: [], source: 'og' };

describe('buildCapture', () => {
  it('marks a full JSON-LD reading as ok', () => {
    const capture = buildCapture(richMeta, { now: 5 });
    expect(capture).toMatchObject({ id: SONG, status: 'ok', source: 'jsonld', fetchedAt: 5, error: '' });
  });

  it('marks an OG-only reading as partial', () => {
    expect(buildCapture(thinMeta, { now: 5 }).status).toBe('partial');
  });

  it('marks playlist and profile readings as manual', () => {
    expect(buildCapture({ ...richMeta, id: '@x' }, { kind: 'profile', now: 5 }).status).toBe('manual');
  });

  it('marks an empty page as failed with a reason', () => {
    const capture = buildCapture({ ...richMeta, found: false, source: 'none', title: '' }, { now: 5 });
    expect(capture.status).toBe('failed');
    expect(capture.error).toContain('no title');
  });

  it('copies the tag array rather than aliasing it', () => {
    const capture = buildCapture(richMeta, { now: 5 });
    expect(capture.tags).not.toBe(richMeta.tags);
    expect(capture.tags).toEqual(richMeta.tags);
  });
});

describe('failedCapture', () => {
  it('records the error and the kind', () => {
    const capture = failedCapture('abc', 'https://suno.com/song/abc', 'song', 'HTTP 500', 7);
    expect(capture).toMatchObject({ status: 'failed', error: 'HTTP 500', fetchedAt: 7, kind: 'song' });
  });
});

describe('captureScore', () => {
  it('ranks a rich capture above a thin one', () => {
    expect(captureScore(buildCapture(richMeta))).toBeGreaterThan(captureScore(buildCapture(thinMeta)));
  });

  it('ranks a failure lowest', () => {
    const failed = failedCapture('x', 'u', 'song', 'boom');
    expect(captureScore(failed)).toBeLessThan(0);
  });
});

describe('mergeCaptures', () => {
  it('keeps the richer record for the same id', () => {
    const thin = buildCapture(thinMeta, { now: 1 });
    const rich = buildCapture(richMeta, { now: 2 });
    expect(mergeCaptures([thin], [rich])).toHaveLength(1);
    expect(mergeCaptures([thin], [rich])[0]?.audioUrl).toBe(rich.audioUrl);
    expect(mergeCaptures([rich], [thin])[0]?.audioUrl).toBe(rich.audioUrl);
  });

  it('keeps distinct songs apart', () => {
    const other = buildCapture({ ...richMeta, id: 'other-id', url: 'https://suno.com/song/other-id' });
    expect(mergeCaptures([buildCapture(richMeta)], [other])).toHaveLength(2);
  });

  it('sorts newest first, then by url', () => {
    const a = buildCapture({ ...richMeta, id: 'a', url: 'https://suno.com/song/a' }, { now: 1 });
    const b = buildCapture({ ...richMeta, id: 'b', url: 'https://suno.com/song/b' }, { now: 9 });
    expect(mergeCaptures([], [a, b]).map((capture) => capture.id)).toEqual(['b', 'a']);
  });

  it('keeps records without an id separate by url', () => {
    const one = buildCapture({ ...richMeta, id: '', url: 'https://suno.com/song/one' });
    const two = buildCapture({ ...richMeta, id: '', url: 'https://suno.com/song/two' });
    expect(mergeCaptures([one], [two])).toHaveLength(2);
  });
});

describe('captureStats', () => {
  it('counts every status', () => {
    const captures = [
      buildCapture(richMeta),
      buildCapture(thinMeta),
      buildCapture({ ...richMeta, id: '@x' }, { kind: 'profile' }),
      failedCapture('f', 'u', 'song', 'x'),
    ];
    expect(captureStats(captures)).toMatchObject({ total: 4, ok: 1, partial: 1, manual: 1, failed: 1, withAudio: 2 });
  });

  it('averages only the captures that have a duration', () => {
    const a = buildCapture({ ...richMeta, id: 'a', durationSeconds: 100 });
    const b = buildCapture({ ...richMeta, id: 'b', durationSeconds: 200 });
    const c = buildCapture({ ...richMeta, id: 'c', durationSeconds: null });
    expect(captureStats([a, b, c]).averageSeconds).toBe(150);
  });

  it('reports null average when nothing has a duration', () => {
    expect(captureStats([buildCapture(thinMeta)]).averageSeconds).toBeNull();
  });

  it('handles an empty list', () => {
    expect(captureStats([])).toMatchObject({ total: 0, averageSeconds: null });
  });
});

describe('toCaptureRows', () => {
  it('flattens tags and omits nested objects', () => {
    const [row] = toCaptureRows([buildCapture(richMeta)]);
    expect(row).toMatchObject({ id: SONG, tags: 'indie pop', duration_seconds: 192, kind: 'song' });
    expect(Object.values(row ?? {}).every((value) => typeof value !== 'object' || value === null)).toBe(true);
  });

  it('uses an empty string for a missing duration', () => {
    const [row] = toCaptureRows([buildCapture({ ...richMeta, durationSeconds: null })]);
    expect(row?.duration_seconds).toBe('');
  });
});
