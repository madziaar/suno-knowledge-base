/**
 * Canonical limits mirror.
 *
 * `docs/suno-limits.json` is the source of truth for the repository. This module
 * is the typed mirror the extension ships (an MV3 extension cannot read a repo
 * file at runtime). `limits.test.ts` asserts the two agree, so drift is caught by
 * CI instead of by a user whose lyrics got cut.
 */

export type ModelId = 'v3.5' | 'v4' | 'v4.5' | 'v4.5+' | 'v5' | 'v5.5';

export interface ModelLimits {
  readonly styleChars: number;
  readonly lyricsChars: number;
  readonly status: 'legacy' | 'current';
}

export const MODEL_LIMITS: Record<ModelId, ModelLimits> = {
  'v3.5': { styleChars: 200, lyricsChars: 3000, status: 'legacy' },
  v4: { styleChars: 200, lyricsChars: 3000, status: 'legacy' },
  'v4.5': { styleChars: 1000, lyricsChars: 5000, status: 'current' },
  'v4.5+': { styleChars: 1000, lyricsChars: 5000, status: 'current' },
  v5: { styleChars: 1000, lyricsChars: 5000, status: 'current' },
  'v5.5': { styleChars: 1000, lyricsChars: 5000, status: 'current' },
};

export const FIELD_LIMITS = {
  simplePromptChars: 500,
  titleChars: 100,
  titleCharsApi: 80,
  excludeStylesChars: 1000,
} as const;

export const QUALITY = {
  styleTagsSweetSpot: [6, 12] as const,
  styleTagsOverloaded: 18,
  lyricsSoftTargetChars: 3000,
} as const;

export const STYLE_FORMAT: Record<ModelId, 'tags' | 'prose'> = {
  'v3.5': 'tags',
  v4: 'tags',
  'v4.5': 'tags',
  'v4.5+': 'tags',
  v5: 'prose',
  'v5.5': 'prose',
};

export const DEFAULT_MODEL: ModelId = 'v5.5';

export function isModelId(value: string): value is ModelId {
  return Object.prototype.hasOwnProperty.call(MODEL_LIMITS, value);
}

export function modelLimits(model: ModelId = DEFAULT_MODEL): ModelLimits {
  return MODEL_LIMITS[model] ?? MODEL_LIMITS[DEFAULT_MODEL];
}

const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

/**
 * Characters, counted the way a human sees them.
 *
 * Uses `Intl.Segmenter` when the engine has it (Chrome 87+, which is our floor),
 * and falls back to code-point counting otherwise. Never counts a surrogate
 * pair twice: an emoji costs one character, and so does a lone surrogate.
 */
export function charCount(text: string): number {
  if (!text) return 0;
  const Segmenter = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (typeof Segmenter === 'function') {
    const segmenter = new Segmenter(undefined, { granularity: 'grapheme' });
    let count = 0;
    for (const _ of segmenter.segment(text)) count += 1;
    return count;
  }
  if (LONE_SURROGATE.test(text)) {
    return [...text].length;
  }
  return Array.from(text).length;
}

export interface TruncateResult {
  readonly value: string;
  readonly truncated: boolean;
  readonly originalChars: number;
  readonly keptChars: number;
}

/**
 * Cut to a grapheme budget.
 *
 * Opt-in only: nothing in this codebase truncates a user's text by default. The
 * result reports what was removed so the UI can warn instead of lying.
 */
export function truncateGraphemes(text: string, budget: number): TruncateResult {
  const originalChars = charCount(text);
  // NaN means "no budget given" — do nothing. A negative budget means zero.
  const limit = Number.isFinite(budget) ? Math.max(0, Math.floor(budget)) : originalChars;
  if (originalChars <= limit) {
    return { value: text, truncated: false, originalChars, keptChars: originalChars };
  }
  const segmenter =
    typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      : null;
  const pieces = segmenter ? Array.from(segmenter.segment(text), (part) => part.segment) : [...text];
  const value = pieces.slice(0, limit).join('');
  return { value, truncated: true, originalChars, keptChars: limit };
}

export interface OverflowReport {
  readonly field: 'style' | 'lyrics' | 'title' | 'exclude' | 'simplePrompt';
  readonly chars: number;
  readonly limit: number;
  readonly over: number;
  readonly ok: boolean;
  /** 0–1, clamped, so a progress bar can be drawn without re-deriving it. */
  readonly ratio: number;
}

export function checkBudget(
  field: OverflowReport['field'],
  text: string,
  model: ModelId = DEFAULT_MODEL,
): OverflowReport {
  const limits = modelLimits(model);
  const limit =
    field === 'style'
      ? limits.styleChars
      : field === 'lyrics'
        ? limits.lyricsChars
        : field === 'title'
          ? FIELD_LIMITS.titleChars
          : field === 'exclude'
            ? FIELD_LIMITS.excludeStylesChars
            : FIELD_LIMITS.simplePromptChars;
  const chars = charCount(text);
  const over = Math.max(0, chars - limit);
  return { field, chars, limit, over, ok: over === 0, ratio: limit === 0 ? 1 : Math.min(1, chars / limit) };
}

/** The sweet-spot tag count for a style string. */
export function tagCountStatus(tags: number): 'thin' | 'good' | 'dense' | 'overloaded' {
  const [min, max] = QUALITY.styleTagsSweetSpot;
  if (tags < min) return 'thin';
  if (tags <= max) return 'good';
  if (tags < QUALITY.styleTagsOverloaded) return 'dense';
  return 'overloaded';
}
