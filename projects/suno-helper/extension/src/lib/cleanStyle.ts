/**
 * Style String Cleaner.
 *
 * Creators paste a paragraph of adjectives, repeat themselves three times, and
 * burn the character budget on words Suno ignores ("epic", "amazing"). This
 * module turns that blob into a tag-shaped string and — crucially — reports what
 * it removed so the user can disagree with it.
 */

import { splitTags, uniqueCaseInsensitive } from './text';
import { charCount } from './limits';

/**
 * Words that add no musical information. Kept deliberately small and
 * conservative: each entry is a word that cannot name a genre, instrument,
 * mood, vocal or production choice.
 */
export const HYPE_WORDS: readonly string[] = [
  'amazing',
  'awesome',
  'best',
  'best ever',
  'breathtaking',
  'brilliant',
  'cool',
  'epic',
  'fantastic',
  'fire',
  'goat',
  'great',
  'hit',
  'incredible',
  'insane',
  'legendary',
  'masterpiece',
  'must listen',
  'must-listen',
  'perfect',
  'phenomenal',
  'stunning',
  'superb',
  'the best',
  'unbelievable',
  'viral',
  'world class',
  'world-class',
];

const HYPE = new Set(HYPE_WORDS.map((word) => word.toLowerCase()));

export interface CleanOptions {
  /** Remove words from `HYPE_WORDS`. Default true. */
  readonly dropHype?: boolean;
  /** Remove case-insensitive repeats. Default true. */
  readonly dedupe?: boolean;
  /** Lowercase every tag. Default false — genre names keep their casing. */
  readonly lowercase?: boolean;
  /** Maximum tags kept. Default 18 (`QUALITY.styleTagsOverloaded`). */
  readonly maxTags?: number;
  /** Character budget used for the `overBudget` flag. Default 1000. */
  readonly maxChars?: number;
}

export interface CleanResult {
  /** The cleaned, comma-joined style string. */
  readonly value: string;
  readonly tags: readonly string[];
  /** Hype words that were dropped, original casing. */
  readonly removed: readonly string[];
  /** Repeats that were dropped (the first spelling is kept). */
  readonly duplicates: readonly string[];
  /** Tags dropped only because `maxTags` was exceeded. */
  readonly droppedOverLimit: readonly string[];
  readonly chars: number;
  readonly overBudget: boolean;
}

/**
 * Remove hype words from a single tag.
 *
 * A tag made only of hype disappears entirely; a tag like `epic indie pop` keeps
 * its musical content. Multi-word hype (`best ever`) is matched before words are
 * stripped, so it cannot leave a stray `ever` behind.
 */
function stripHype(tag: string): { value: string; removed: string[] } {
  const lower = tag.toLowerCase();
  if (HYPE.has(lower)) return { value: '', removed: [tag] };

  let working = tag;
  const removed: string[] = [];
  for (const phrase of HYPE_WORDS) {
    if (!phrase.includes(' ')) continue;
    const pattern = new RegExp(`(^|[\\s,])${phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}($|[\\s,])`, 'gi');
    if (pattern.test(working)) {
      removed.push(phrase);
      working = working.replace(pattern, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  const words = working.split(/\s+/).filter(Boolean);
  const kept: string[] = [];
  for (const word of words) {
    const bare = word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
    if (HYPE.has(bare.toLowerCase())) {
      removed.push(bare);
      continue;
    }
    kept.push(word);
  }
  return { value: kept.join(' ').replace(/\s+/g, ' ').trim(), removed };
}

const DEFAULTS = {
  dropHype: true,
  dedupe: true,
  lowercase: false,
  maxTags: 18,
  maxChars: 1000,
} as const;

export function cleanStyle(input: string, options: CleanOptions = {}): CleanResult {
  const settings = { ...DEFAULTS, ...options };
  const raw = splitTags(input ?? '');

  const removed: string[] = [];
  const kept: string[] = [];

  for (const tag of raw) {
    // Hype is usually an adjective inside a real tag ("epic indie pop"), so it is
    // stripped word by word rather than only when it stands alone.
    const cleaned = settings.dropHype ? stripHype(tag) : { value: tag, removed: [] };
    removed.push(...cleaned.removed);
    if (!cleaned.value) continue;
    kept.push(settings.lowercase ? cleaned.value.toLowerCase() : cleaned.value);
  }

  const duplicates: string[] = [];
  let tags: string[];
  if (settings.dedupe) {
    const seen = new Set<string>();
    tags = [];
    for (const tag of kept) {
      const key = tag.toLowerCase();
      if (seen.has(key)) {
        duplicates.push(tag);
        continue;
      }
      seen.add(key);
      tags.push(tag);
    }
  } else {
    tags = kept;
  }

  const limit = Math.max(0, Math.floor(settings.maxTags));
  const droppedOverLimit = tags.slice(limit);
  if (droppedOverLimit.length > 0) {
    tags = tags.slice(0, limit);
  }

  const value = tags.join(', ');
  const chars = charCount(value);

  return {
    value,
    tags,
    removed,
    duplicates,
    droppedOverLimit,
    chars,
    overBudget: chars > settings.maxChars,
  };
}

/** Convenience for the "clean my paste" button: value + a one-line explanation. */
export function explainClean(result: CleanResult): string {
  const parts: string[] = [];
  if (result.removed.length) parts.push(`${result.removed.length} hype word${result.removed.length === 1 ? '' : 's'}`);
  if (result.duplicates.length) parts.push(`${result.duplicates.length} duplicate${result.duplicates.length === 1 ? '' : 's'}`);
  if (result.droppedOverLimit.length) parts.push(`${result.droppedOverLimit.length} over the tag cap`);
  if (parts.length === 0) return 'Already clean — nothing removed.';
  return `Removed ${parts.join(', ')}.`;
}

export { uniqueCaseInsensitive };
