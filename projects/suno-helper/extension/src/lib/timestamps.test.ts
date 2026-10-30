import { describe, expect, it } from 'vitest';

import {
  cuesFromTaps,
  distributeCues,
  estimateSyllables,
  formatClock,
  formatLrcStamp,
  parseLrc,
  retime,
  toLines,
  toLrc,
  toSrt,
  toVtt,
} from './timestamps';

const LYRICS = ['first line', 'second line', 'third line', 'fourth line'].join('\n');

describe('estimateSyllables', () => {
  it('counts vowel groups in latin text', () => {
    expect(estimateSyllables('beautiful')).toBe(3);
    expect(estimateSyllables('go')).toBe(1);
  });

  it('counts CJK characters, one syllable each', () => {
    expect(estimateSyllables('東京の夜')).toBe(4);
  });

  it('returns zero for blank input', () => {
    expect(estimateSyllables('   ')).toBe(0);
  });
});

describe('toLines', () => {
  it('drops blank lines and section tags', () => {
    expect(toLines('[Verse 1]\n\nhello\n\n[Chorus]\nworld')).toEqual(['hello', 'world']);
  });

  it('keeps section tags when asked', () => {
    expect(toLines('[Verse 1]\nhello', true)).toEqual(['[Verse 1]', 'hello']);
  });

  it('normalises CRLF', () => {
    expect(toLines('a\r\nb')).toEqual(['a', 'b']);
  });
});

describe('distributeCues', () => {
  it('packs equal lines across the duration', () => {
    // Equal weight, so the split is exactly even. (The shared LYRICS fixture
    // has "second line" one syllable longer and is deliberately not used here.)
    const cues = distributeCues('aa bb\ncc dd\nee ff\ngg hh', { durationSeconds: 60 });
    expect(cues).toHaveLength(4);
    expect(cues[0]!.start).toBe(0);
    expect(cues[0]!.end).toBeCloseTo(15, 3);
    expect(cues[3]!.end).toBeCloseTo(60, 3);
  });

  it('marks every cue as estimated', () => {
    expect(distributeCues('one line', { durationSeconds: 10 }).every((cue) => cue.estimated)).toBe(true);
  });

  it('honours the offset', () => {
    const cues = distributeCues(LYRICS, { durationSeconds: 60, offsetSeconds: 10 });
    expect(cues[0]!.start).toBe(10);
  });

  it('gives short lines at least the minimum cue length', () => {
    const cues = distributeCues('a\n' + 'word '.repeat(40).trim(), { durationSeconds: 6, minCueSeconds: 1 });
    expect(cues[0]!.end - cues[0]!.start).toBeGreaterThanOrEqual(1);
    expect(cues[1]!.end).toBeLessThanOrEqual(6);
  });

  it('returns nothing for empty lyrics', () => {
    expect(distributeCues('   \n\n', { durationSeconds: 30 })).toEqual([]);
  });

  it('never runs past the duration', () => {
    const cues = distributeCues(LYRICS, { durationSeconds: 20 });
    expect(Math.max(...cues.map((cue) => cue.end))).toBeLessThanOrEqual(20);
    expect(cues[cues.length - 1]!.end).toBeCloseTo(20, 3);
  });
});

describe('formatters', () => {
  it('writes LRC stamps', () => {
    expect(formatLrcStamp(65.5)).toBe('01:05.50');
    expect(formatLrcStamp(0)).toBe('00:00.00');
  });

  it('writes SRT and VTT clocks', () => {
    expect(formatClock(3661.5, ',')).toBe('01:01:01,500');
    expect(formatClock(3661.5, '.')).toBe('01:01:01.500');
  });
});

describe('exporters', () => {
  const cues = distributeCues(LYRICS, { durationSeconds: 40 });

  it('writes LRC with metadata and an honesty comment', () => {
    const lrc = toLrc(cues, { title: 'Song', artist: 'Me' });
    expect(lrc.startsWith('[ti:Song]')).toBe(true);
    expect(lrc).toContain('[ar:Me]');
    expect(lrc).toContain('estimated');
    expect(lrc).toContain('[00:00.00]first line');
  });

  it('writes numbered SRT blocks', () => {
    const srt = toSrt(cues);
    expect(srt.startsWith('1\n00:00:00,000 --> ')).toBe(true);
    expect(srt.trim().split('\n\n')).toHaveLength(4);
  });

  it('writes a WebVTT header', () => {
    const vtt = toVtt(cues);
    expect(vtt.startsWith('WEBVTT')).toBe(true);
    expect(vtt).toContain('00:00:00.000 --> ');
  });
});

describe('parseLrc', () => {
  it('reads timestamps and ignores metadata tags', () => {
    const cues = parseLrc('[ti:X]\n[00:12.50]hello\n[00:20.00]world');
    expect(cues).toHaveLength(2);
    expect(cues[0]!.start).toBeCloseTo(12.5, 3);
    expect(cues[0]!.end).toBeCloseTo(20, 3);
    expect(cues[0]!.estimated).toBe(false);
    expect(cues[1]!.text).toBe('world');
  });

  it('sorts out-of-order lines', () => {
    const cues = parseLrc('[00:30.00]second\n[00:10.00]first');
    expect(cues.map((cue) => cue.text)).toEqual(['first', 'second']);
  });

  it('round-trips through toLrc', () => {
    const original = distributeCues(LYRICS, { durationSeconds: 40 });
    const parsed = parseLrc(toLrc(original));
    expect(parsed.map((cue) => cue.text)).toEqual(original.map((cue) => cue.text));
    parsed.forEach((cue, i) => expect(cue.start).toBeCloseTo(original[i]!.start, 1));
  });
});

describe('retime', () => {
  const cues = [
    { index: 1, start: 0, end: 10, text: 'a', estimated: false },
    { index: 2, start: 10, end: 20, text: 'b', estimated: false },
  ];

  it('scales a set onto a new duration', () => {
    const out = retime(cues, { scaleTo: 40 });
    expect(out[0]!.start).toBe(0);
    expect(out[1]!.end).toBe(40);
  });

  it('shifts a set', () => {
    const out = retime(cues, { shiftSeconds: 5 });
    expect(out[0]!.start).toBe(5);
    expect(out[1]!.end).toBe(25);
  });
});

describe('cuesFromTaps', () => {
  it('turns taps into real cues', () => {
    const cues = cuesFromTaps([2, 6], ['one', 'two'], 12);
    expect(cues[0]).toMatchObject({ start: 2, end: 6, text: 'one', estimated: false });
    expect(cues[1]).toMatchObject({ start: 6, end: 12, text: 'two' });
  });
});
