/**
 * Structure Tag Normalizer.
 *
 * Suno reads section tags in the lyrics field: `[Verse]`, `[Chorus]`, ….
 * Creators arrive with `(couplet)`, `【副歌】`, `[verse 1]` and `[VERSE]`.
 * This module folds all of that to one canonical form and never invents a tag
 * it is not sure about.
 */

export const CANONICAL_TAGS = [
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Post-Chorus',
  'Bridge',
  'Breakdown',
  'Drop',
  'Hook',
  'Instrumental',
  'Solo',
  'Interlude',
  'Outro',
  'End',
] as const;

/** Performance hints Suno understands inside a section tag, e.g. `[Chorus - whispered]`. */
export const PERFORMANCE_TAGS = ['whispered', 'spoken', 'belted', 'falsetto', 'harmonized', 'a cappella', 'lo-fi'] as const;

export type CanonicalTag = (typeof CANONICAL_TAGS)[number] | (typeof PERFORMANCE_TAGS)[number];

const ALIASES: Record<string, CanonicalTag> = {
  // English
  intro: 'Intro',
  introduction: 'Intro',
  verse: 'Verse',
  'verse 1': 'Verse',
  'verse 2': 'Verse',
  'verse 3': 'Verse',
  prechorus: 'Pre-Chorus',
  'pre chorus': 'Pre-Chorus',
  'pre-chorus': 'Pre-Chorus',
  chorus: 'Chorus',
  refrain: 'Chorus',
  postchorus: 'Post-Chorus',
  'post chorus': 'Post-Chorus',
  'post-chorus': 'Post-Chorus',
  bridge: 'Bridge',
  breakdown: 'Breakdown',
  drop: 'Drop',
  hook: 'Hook',
  instrumental: 'Instrumental',
  solo: 'Solo',
  interlude: 'Interlude',
  outro: 'Outro',
  ending: 'End',
  end: 'End',
  // Romance
  estribillo: 'Chorus',
  coro: 'Chorus',
  couplet: 'Verse',
  pont: 'Bridge',
  puente: 'Bridge',
  refrão: 'Chorus',
  refrao: 'Chorus',
  verso: 'Verse',
  introdução: 'Intro',
  introducao: 'Intro',
  ponte: 'Bridge',
  final: 'Outro',
  // German / Dutch / Scandinavian
  strophe: 'Verse',
  refrain_de: 'Chorus',
  brucke: 'Bridge',
  brücke: 'Bridge',
  couplet_nl: 'Verse',
  refrein: 'Chorus',
  brug: 'Bridge',
  vers: 'Verse',
  // Slavic
  припев: 'Chorus',
  куплет: 'Verse',
  бридж: 'Bridge',
  вступление: 'Intro',
  końcówka: 'Outro',
  refren: 'Chorus',
  zwrotka: 'Verse',
  // CJK
  前奏: 'Intro',
  主歌: 'Verse',
  副歌: 'Chorus',
  间奏: 'Interlude',
  桥段: 'Bridge',
  尾奏: 'Outro',
  サビ: 'Chorus',
  イントロ: 'Intro',
  アウトロ: 'Outro',
};

export interface ParsedTag {
  /** The text inside the brackets, trimmed. */
  readonly raw: string;
  /** Canonical name, when recognised. */
  readonly canonical: CanonicalTag | null;
  /** Performance hint after a dash or comma, lowercased. */
  readonly hint: string | null;
  /** Characters before the opening bracket. */
  readonly start: number;
  /** Characters after the closing bracket. */
  readonly end: number;
}

const OPENERS: Record<string, string> = { '[': ']', '【': '】', '(': ')', '（': '）', '{': '}' };
const CLOSERS = new Set(Object.values(OPENERS));

/**
 * Find the first bracketed tag in a line, honouring nesting.
 *
 * A regex like `\[([^\]]+)\]` breaks on `[Verse (quiet)]`; counting depth does
 * not. Returns `null` when the line does not start with a tag.
 */
export function parseTagLine(line: string): ParsedTag | null {
  const start = line.length - line.trimStart().length;
  const first = line[start];
  if (!first) return null;
  const closer = OPENERS[first];
  if (!closer) return null;

  let depth = 0;
  for (let index = start; index < line.length; index += 1) {
    const char = line[index];
    if (char === first) depth += 1;
    else if (char === closer) {
      depth -= 1;
      if (depth === 0) {
        const raw = line.slice(start + 1, index).trim();
        if (!raw) return null;
        return {
          raw,
          canonical: lookup(raw),
          hint: extractHint(raw),
          start,
          end: index + 1,
        };
      }
    }
  }
  return null;
}

function extractHint(raw: string): string | null {
  const match = raw.match(/[-–—,:]\s*([a-z][a-z\s]{2,})$/i);
  return match?.[1] ? match[1].trim().toLowerCase() : null;
}

export function lookup(raw: string): CanonicalTag | null {
  // `[Verse (quiet)]` and `[Verse 2 (soft)]` must resolve to the section, not to
  // the parenthetical. Strip bracketed asides before matching.
  const cleaned = raw
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]|（[^）]*）|【[^】]*】/g, ' ')
    .replace(/[()[\]{}【】（）]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const direct = ALIASES[cleaned];
  if (direct) return direct;
  // "verse 2 (soft)" → "verse 2"
  const base = cleaned.replace(/\s*[-,:].*$/, '').trim();
  const hit = ALIASES[base];
  if (hit) return hit;
  for (const tag of [...CANONICAL_TAGS, ...PERFORMANCE_TAGS]) {
    if (tag.toLowerCase() === cleaned) return tag as CanonicalTag;
  }
  return null;
}

export interface TagIssue {
  readonly line: number;
  readonly kind: 'alias' | 'casing' | 'brackets' | 'unknown';
  readonly from: string;
  readonly to: string;
}

export interface NormalizeResult {
  readonly value: string;
  readonly issues: readonly TagIssue[];
  readonly changed: number;
  readonly unknowns: readonly string[];
}

export interface NormalizeOptions {
  /** Bracket pair to emit. Default `[` `]`. */
  readonly brackets?: readonly [string, string];
  /** Report-only mode: compute the issues but return the input unchanged. */
  readonly dryRun?: boolean;
}

export function normalizeTags(input: string, options: NormalizeOptions = {}): NormalizeResult {
  const [open, close] = options.brackets ?? ['[', ']'];
  const source = input ?? '';
  const issues: TagIssue[] = [];
  const unknowns: string[] = [];
  const out: string[] = [];

  source.split('\n').forEach((line, index) => {
    const parsed = parseTagLine(line);
    if (!parsed) {
      out.push(line);
      return;
    }
    const trailing = line.slice(parsed.end).replace(/^\s*[-–—:,]?\s*/, '');
    if (!parsed.canonical) {
      unknowns.push(parsed.raw);
      out.push(line);
      return;
    }
    const canonicalText = parsed.hint && !parsed.raw.toLowerCase().includes(parsed.hint)
      ? `${parsed.canonical} - ${parsed.hint}`
      : parsed.canonical;
    const rebuilt = `${open}${canonicalText}${close}${trailing ? ` ${trailing}` : ''}`;
    if (rebuilt !== line) {
      const kind: TagIssue['kind'] =
        parsed.raw !== parsed.canonical.toLowerCase() && lookup(parsed.raw) === parsed.canonical
          ? line.trimStart().startsWith('[')
            ? 'alias'
            : 'brackets'
          : 'alias';
      issues.push({ line: index + 1, kind, from: line, to: rebuilt });
    }
    out.push(rebuilt);
  });

  return {
    value: options.dryRun ? source : out.join('\n'),
    issues,
    changed: issues.length,
    unknowns,
  };
}

/**
 * Insert `[Verse]` / `[Chorus]` where repetition makes the structure obvious.
 *
 * Only runs when the draft has no tags at all and at least one repeated line —
 * otherwise the tool would be guessing.
 */
export function inferMissingStructure(input: string): { value: string; changed: number } {
  const source = input ?? '';
  if (source.split('\n').some((line) => parseTagLine(line)?.canonical)) {
    return { value: source, changed: 0 };
  }
  const lines = source.split('\n');
  const counts = new Map<string, number>();
  for (const line of lines) {
    const key = line.trim().toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const repeated = [...counts.entries()].filter(([, count]) => count > 1).map(([line]) => line);
  if (repeated.length === 0) {
    return { value: source, changed: 0 };
  }
  const chorusLine = repeated.sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))[0];

  let changed = 0;
  const out: string[] = [];
  let inChorus = false;
  let inVerse = false;
  for (const line of lines) {
    const key = line.trim().toLowerCase();
    if (!key) {
      inChorus = false;
      inVerse = false;
      out.push(line);
      continue;
    }
    if (key === chorusLine) {
      if (!inChorus) {
        out.push('[Chorus]');
        changed += 1;
        inChorus = true;
        inVerse = false;
      }
      out.push(line);
      continue;
    }
    if (!inVerse && !inChorus) {
      out.push('[Verse]');
      changed += 1;
      inVerse = true;
    }
    out.push(line);
  }
  return { value: out.join('\n'), changed };
}

export interface TagStats {
  readonly counts: Readonly<Record<string, number>>;
  readonly total: number;
  readonly unknown: number;
  readonly hasChorus: boolean;
}

export function tagStats(input: string): TagStats {
  const counts: Record<string, number> = {};
  let total = 0;
  let unknown = 0;
  for (const line of (input ?? '').split('\n')) {
    const parsed = parseTagLine(line);
    if (!parsed) continue;
    if (!parsed.canonical) {
      unknown += 1;
      continue;
    }
    total += 1;
    counts[parsed.canonical] = (counts[parsed.canonical] ?? 0) + 1;
  }
  return { counts, total, unknown, hasChorus: (counts.Chorus ?? 0) > 0 };
}
