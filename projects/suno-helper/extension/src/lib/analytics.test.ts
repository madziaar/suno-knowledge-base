import { describe, expect, it } from 'vitest';

import { analyzeSongs, durationBuckets, formatDuration, formatHours, tally } from './analytics';
import type { AnalysableSong } from './analytics';

const song = (over: Partial<AnalysableSong> = {}): AnalysableSong => ({
  title: 'Track',
  creator: 'me',
  durationSeconds: 180,
  tags: ['dream pop'],
  ...over,
});

describe('tally', () => {
  it('counts case-insensitively and sorts by count', () => {
    expect(tally(['Rock', 'rock', 'pop'])).toEqual([
      { name: 'Rock', count: 2 },
      { name: 'pop', count: 1 },
    ]);
  });

  it('ignores blanks', () => {
    expect(tally(['', '  ', 'x'])).toEqual([{ name: 'x', count: 1 }]);
  });
});

describe('analyzeSongs', () => {
  const songs = [song({ durationSeconds: 100 }), song({ durationSeconds: 200 }), song({ durationSeconds: 300 })];

  it('computes the basic statistics', () => {
    const stats = analyzeSongs(songs);
    expect(stats.count).toBe(3);
    expect(stats.meanSeconds).toBe(200);
    expect(stats.medianSeconds).toBe(200);
    expect(stats.minSeconds).toBe(100);
    expect(stats.maxSeconds).toBe(300);
    expect(stats.totalSeconds).toBe(600);
  });

  it('flags small samples instead of pretending they are patterns', () => {
    expect(analyzeSongs(songs).thin).toBe(true);
    expect(analyzeSongs([...songs, ...songs]).thin).toBe(false);
  });

  it('counts missing durations rather than treating them as zero', () => {
    const stats = analyzeSongs([...songs, song({ durationSeconds: null })]);
    expect(stats.withDuration).toBe(3);
    expect(stats.missingDuration).toBe(1);
    expect(stats.meanSeconds).toBe(200);
  });

  it('splits style strings into individual tags', () => {
    const stats = analyzeSongs([song({ tags: ['dream pop, shoegaze'] }), song({ tags: ['shoegaze'] })]);
    expect(stats.tags[0]).toEqual({ name: 'shoegaze', count: 2 });
    expect(stats.tags).toContainEqual({ name: 'dream pop', count: 1 });
  });

  it('finds duplicate titles', () => {
    const stats = analyzeSongs([song({ title: 'Same' }), song({ title: 'same' }), song({ title: 'Other' })]);
    expect(stats.duplicates).toEqual([{ name: 'same', count: 2 }]);
  });

  it('survives an empty library', () => {
    const stats = analyzeSongs([]);
    expect(stats.count).toBe(0);
    expect(stats.meanSeconds).toBe(0);
    expect(stats.thin).toBe(false);
  });
});

describe('durationBuckets', () => {
  it('bins by minute with an open top bucket', () => {
    const buckets = durationBuckets([30, 90, 150, 210, 600]);
    expect(buckets.map((bucket) => bucket.count)).toEqual([1, 1, 1, 1, 0, 1]);
  });

  it('puts boundary values in the upper bin', () => {
    const buckets = durationBuckets([60]);
    expect(buckets[0]!.count).toBe(0);
    expect(buckets[1]!.count).toBe(1);
  });
});

describe('formatters', () => {
  it('writes readable durations', () => {
    expect(formatDuration(222)).toBe('3:42');
    expect(formatDuration(0)).toBe('0:00');
  });

  it('switches from minutes to hours', () => {
    expect(formatHours(600)).toBe('10 min');
    expect(formatHours(7200)).toBe('2.0 h');
  });
});
