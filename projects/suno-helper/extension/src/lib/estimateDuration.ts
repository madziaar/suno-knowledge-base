/**
 * Duration Estimator.
 *
 * Syllables × pace, per section. This is a planning aid, not a measurement —
 * the field guide says so, and so does the UI.
 */

export interface PacePreset {
  readonly id: string;
  readonly label: string;
  /** Syllables per second. */
  readonly rate: number;
}

export const PACE_PRESETS: readonly PacePreset[] = [
  { id: 'ballad', label: 'Ballad (slow)', rate: 2.2 },
  { id: 'midtempo', label: 'Mid-tempo', rate: 3.0 },
  { id: 'upbeat', label: 'Upbeat', rate: 3.8 },
  { id: 'rap', label: 'Rap / dense', rate: 4.8 },
];

export const DEFAULT_PACE = 'midtempo';

/** Fixed padding for sections with no words, in seconds. */
export const INSTRUMENTAL_SECONDS: Readonly<Record<string, number>> = {
  Intro: 8,
  Interlude: 10,
  Instrumental: 16,
  Solo: 12,
  Breakdown: 10,
  Drop: 8,
  Outro: 10,
  End: 4,
};

const SECTION_FALLBACK = 10;

/** Rough syllable counter: vowel groups, minus a silent trailing `e`. */
export function countSyllables(text: string): number {
  const words = (text ?? '').toLowerCase().match(/[a-z\u00c0-\u024f\u0400-\u04ff]+/g) ?? [];
  let total = 0;
  for (const word of words) {
    let groups = word.match(/[aeiouy\u00e0-\u00ff\u0430-\u044f]+/g)?.length ?? 0;
    if (groups === 0) groups = 1;
    if (/[^aeiou]e$/.test(word) && groups > 1) groups -= 1;
    total += groups;
  }
  return total;
}

export interface SectionEstimate {
  readonly name: string;
  readonly lines: number;
  readonly syllables: number;
  readonly seconds: number;
}

export interface DurationEstimate {
  readonly sections: readonly SectionEstimate[];
  readonly seconds: number;
  readonly formatted: string;
  readonly syllables: number;
  readonly pace: PacePreset;
}

function paceFor(paceId: string): PacePreset {
  return PACE_PRESETS.find((preset) => preset.id === paceId) ?? PACE_PRESETS.find((p) => p.id === DEFAULT_PACE) ?? PACE_PRESETS[0]!;
}

/**
 * Estimate runtime section by section.
 *
 * A section is a `[Tag]` line and everything under it. Text before the first tag
 * is treated as `Verse`. Sections with no words get the instrumental padding.
 */
export function estimateDuration(lyrics: string, paceId: string = DEFAULT_PACE): DurationEstimate {
  const pace = paceFor(paceId);
  const source = (lyrics ?? '').replace(/\r\n?/g, '\n');
  const rawSections: { name: string; lines: string[] }[] = [];
  let current: { name: string; lines: string[] } | null = null;

  for (const line of source.split('\n')) {
    const tag = line.trim().match(/^[[【(（]\s*([^\]】)）]+?)\s*[\]】)）]\s*$/);
    if (tag?.[1]) {
      const name = tag[1].split(/[-–—,:]/)[0]?.trim() ?? tag[1].trim();
      current = { name: name || 'Section', lines: [] };
      rawSections.push(current);
      continue;
    }
    if (!current) {
      if (line.trim() === '') continue;
      current = { name: 'Verse', lines: [] };
      rawSections.push(current);
    }
    current.lines.push(line);
  }

  let totalSeconds = 0;
  let totalSyllables = 0;
  const sections: SectionEstimate[] = rawSections.map((section) => {
    const text = section.lines.filter((line) => line.trim() !== '').join('\n');
    const syllables = countSyllables(text);
    const lines = section.lines.filter((line) => line.trim() !== '').length;
    const seconds =
      syllables === 0
        ? (INSTRUMENTAL_SECONDS[section.name] ?? SECTION_FALLBACK)
        : Math.round((syllables / pace.rate) * 10) / 10;
    totalSeconds += seconds;
    totalSyllables += syllables;
    return { name: section.name, lines, syllables, seconds };
  });

  const seconds = Math.round(totalSeconds);
  return {
    sections,
    seconds,
    formatted: formatDuration(seconds),
    syllables: totalSyllables,
    pace,
  };
}

/** `m:ss`. */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}
