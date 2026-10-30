/**
 * The hand-off between the popup and the full-page studio.
 *
 * The popup cannot render a video: it closes the moment the user clicks
 * anything outside it, which kills a `MediaRecorder`. So the popup edits the
 * lyrics and timings, writes this draft, and opens `studio.html` in a tab.
 * A tab survives losing focus — that is the entire reason the page exists.
 */

import type { Cue } from './timestamps';

export interface StudioDraft {
  readonly title: string;
  readonly lyrics: string;
  readonly cues: readonly Cue[];
  readonly themeId: string;
  readonly updatedAt: number;
}

export const DRAFT_KEY = 'studioDraft';

export const EMPTY_DRAFT: StudioDraft = {
  title: 'Untitled',
  lyrics: '',
  cues: [],
  themeId: 'midnight',
  updatedAt: 0,
};

/** Tolerate anything: a draft from an older version must not break the page. */
export function migrateDraft(raw: unknown): StudioDraft {
  if (!raw || typeof raw !== 'object') return EMPTY_DRAFT;
  const value = raw as Partial<StudioDraft> & { cues?: unknown };
  const cues = Array.isArray(value.cues) ? value.cues : [];
  return {
    title: typeof value.title === 'string' ? value.title : 'Untitled',
    lyrics: typeof value.lyrics === 'string' ? value.lyrics : '',
    cues: cues
      .filter((cue): cue is Cue => Boolean(cue) && typeof cue === 'object')
      .map((cue, index) => ({
        index: index + 1,
        start: Number(cue.start) || 0,
        end: Number(cue.end) || 0,
        text: typeof cue.text === 'string' ? cue.text : '',
        estimated: cue.estimated !== false,
      }))
      .filter((cue) => cue.text.length > 0 && cue.end > cue.start)
      .sort((a, b) => a.start - b.start),
    themeId: typeof value.themeId === 'string' ? value.themeId : 'midnight',
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : 0,
  };
}

/** `3:42` or `222` → seconds. Returns null for anything it cannot read. */
export function parseDurationInput(value: string): number | null {
  const text = value.trim();
  if (!text) return null;
  const clock = text.match(/^(\d{1,3}):([0-5]?\d)(?:\.(\d{1,2}))?$/);
  if (clock) {
    const minutes = Number(clock[1]);
    const seconds = Number(clock[2]);
    const frac = clock[3] ? Number(`0.${clock[3]}`) : 0;
    return minutes * 60 + seconds + frac;
  }
  const plain = Number(text);
  return Number.isFinite(plain) && plain > 0 ? plain : null;
}
