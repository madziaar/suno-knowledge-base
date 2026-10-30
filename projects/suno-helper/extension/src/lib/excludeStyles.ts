/**
 * Exclude-Styles Generator.
 *
 * The negative prompt is the cheapest quality lever in Suno: one line of
 * "what this is not" removes a whole family of bad generations. Grouped by
 * category so the UI can offer toggles instead of a blank text box.
 */

import { uniqueCaseInsensitive } from './text';
import { charCount } from './limits';

export interface ExcludeCategory {
  readonly id: string;
  readonly label: string;
  readonly items: readonly string[];
}

export const EXCLUDE_CATEGORIES: readonly ExcludeCategory[] = [
  {
    id: 'vocals',
    label: 'Vocal problems',
    items: ['autotune', 'chipmunk vocals', 'growling', 'spoken intro', 'vocal fry', 'choir'],
  },
  {
    id: 'instruments',
    label: 'Wrong instruments',
    items: ['saxophone', 'banjo', 'bagpipes', 'accordion', 'kazoo', 'church organ'],
  },
  {
    id: 'production',
    label: 'Production problems',
    items: ['lo-fi hiss', 'brickwalled', 'muddy mix', 'clipping', 'excessive reverb', 'cheap drums'],
  },
  {
    id: 'mood',
    label: 'Wrong mood',
    items: ['aggressive', 'cheerful', 'sarcastic', 'dark', 'sentimental', 'triumphant'],
  },
  {
    id: 'structure',
    label: 'Structure problems',
    items: ['spoken word', 'long intro', 'fade out', 'abrupt ending', 'key change', 'tempo change'],
  },
  {
    id: 'genre',
    label: 'Genre bleed',
    items: ['country', 'metal', 'reggaeton', 'trap', 'opera', 'christmas'],
  },
];

/** `fields.exclude_styles_chars` in docs/suno-limits.json. */
export const EXCLUDE_LIMIT = 1000;

export interface ExcludeResult {
  readonly value: string;
  readonly items: readonly string[];
  readonly chars: number;
  readonly overBudget: boolean;
  /** Items that did not fit, in the order they were supplied. */
  readonly dropped: readonly string[];
}

/**
 * Build the exclude string.
 *
 * Trims in list order, never silently: whatever did not fit is returned in
 * `dropped` so the UI can say "3 items did not fit" instead of quietly cutting.
 */
export function buildExclude(selected: readonly string[], limit = EXCLUDE_LIMIT): ExcludeResult {
  const items: string[] = [];
  const dropped: string[] = [];
  let length = 0;

  for (const item of uniqueCaseInsensitive(selected.map((value) => value.trim()).filter(Boolean))) {
    const cost = item.length + (items.length > 0 ? 2 : 0);
    if (length + cost > limit) {
      dropped.push(item);
      continue;
    }
    items.push(item);
    length += cost;
  }

  const value = items.join(', ');
  return { value, items, chars: charCount(value), overBudget: dropped.length > 0, dropped };
}

/** Starting set for a genre — a suggestion, never applied automatically. */
export function suggestFor(genre: string): readonly string[] {
  const key = (genre ?? '').toLowerCase();
  const picks: string[] = [];
  if (/lo-?fi|chill|study/.test(key)) picks.push('lo-fi hiss', 'cheap drums', 'vocal fry');
  if (/metal|rock|punk/.test(key)) picks.push('autotune', 'chipmunk vocals');
  if (/pop|dance|edm/.test(key)) picks.push('country', 'banjo', 'fade out');
  if (/folk|acoustic|americana/.test(key)) picks.push('808s', 'trap', 'brickwalled');
  if (/rap|hip.?hop/.test(key)) picks.push('choir', 'church organ', 'saxophone');
  if (/jazz|soul/.test(key)) picks.push('autotune', 'chipmunk vocals', 'excessive reverb');
  if (picks.length === 0) picks.push('autotune', 'long intro', 'fade out');
  return uniqueCaseInsensitive(picks);
}
