import { describe, expect, it } from 'vitest';

import { DEFAULT_PACE, INSTRUMENTAL_SECONDS, PACE_PRESETS, countSyllables, estimateDuration, formatDuration } from './estimateDuration';

describe('countSyllables', () => {
  it('counts vowel groups', () => {
    expect(countSyllables('hello world')).toBe(3);
  });

  it('drops a silent trailing e', () => {
    expect(countSyllables('make')).toBe(1);
    expect(countSyllables('believe')).toBe(2);
  });

  it('counts a consonant-only token as one syllable', () => {
    expect(countSyllables('shh')).toBe(1);
  });

  it('ignores punctuation and digits', () => {
    expect(countSyllables('love, 2 times!')).toBe(3);
  });

  it('handles non-latin text gracefully', () => {
    expect(countSyllables('привет')).toBeGreaterThan(0);
    expect(countSyllables('')).toBe(0);
  });
});

describe('estimateDuration', () => {
  it('estimates each section and the total', () => {
    const lyrics = '[Verse]\nhello world it is a long long night\n[Chorus]\nhello world again';
    const estimate = estimateDuration(lyrics, 'midtempo');
    expect(estimate.sections).toHaveLength(2);
    expect(estimate.sections.map((section) => section.name)).toEqual(['Verse', 'Chorus']);
    expect(estimate.seconds).toBeGreaterThan(0);
    expect(estimate.syllables).toBeGreaterThan(0);
    expect(estimate.formatted).toMatch(/^\d+:\d{2}$/);
  });

  it('uses instrumental padding for a wordless section', () => {
    const estimate = estimateDuration('[Intro]\n[Verse]\nhello there', 'midtempo');
    const intro = estimate.sections[0];
    expect(intro?.seconds).toBe(INSTRUMENTAL_SECONDS.Intro);
  });

  it('treats text before the first tag as a verse', () => {
    const estimate = estimateDuration('untagged first line');
    expect(estimate.sections[0]?.name).toBe('Verse');
  });

  it('slower pace means a longer song', () => {
    const lyrics = '[Verse]\n' + 'la la la la la\n'.repeat(8);
    expect(estimateDuration(lyrics, 'ballad').seconds).toBeGreaterThan(estimateDuration(lyrics, 'rap').seconds);
  });

  it('falls back to the default pace for an unknown id', () => {
    const estimate = estimateDuration('[Verse]\nhello', 'no-such-pace');
    expect(estimate.pace.id).toBe(DEFAULT_PACE);
  });

  it('returns zero for empty lyrics', () => {
    const estimate = estimateDuration('');
    expect(estimate.sections).toEqual([]);
    expect(estimate.seconds).toBe(0);
    expect(estimate.formatted).toBe('0:00');
  });

  it('handles CRLF input', () => {
    expect(estimateDuration('[Verse]\r\nhello\r\n').sections).toHaveLength(1);
  });

  it('strips a performance hint from the section name', () => {
    expect(estimateDuration('[Chorus - whispered]\nhello').sections[0]?.name).toBe('Chorus');
  });

  it('exposes pace presets in a stable order', () => {
    expect(PACE_PRESETS.map((preset) => preset.id)).toEqual(['ballad', 'midtempo', 'upbeat', 'rap']);
    expect(PACE_PRESETS.map((preset) => preset.rate)).toEqual([...PACE_PRESETS.map((preset) => preset.rate)].sort((a, b) => a - b));
  });
});

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
  });

  it('rolls into hours implicitly', () => {
    expect(formatDuration(3600)).toBe('60:00');
  });

  it('clamps negatives', () => {
    expect(formatDuration(-10)).toBe('0:00');
  });
});
