/**
 * Suno link parsing for the batch tools.
 *
 * Takes whatever a user pastes — a spreadsheet column, a chat log, a bookmark
 * dump — and turns it into a clean, deduplicated list of song references. Pure:
 * it never fetches, never touches the DOM, and never guesses an id.
 */

export type RefKind = 'song' | 'playlist' | 'profile';

export interface SongRef {
  readonly index: number;
  readonly kind: RefKind;
  readonly id: string;
  readonly canonicalUrl: string;
}

export interface InvalidEntry {
  readonly index: number;
  readonly raw: string;
  readonly reason: string;
}

export interface ParseLinksResult {
  readonly refs: readonly SongRef[];
  readonly invalid: readonly InvalidEntry[];
  readonly duplicates: readonly string[];
  readonly total: number;
}

const HOST = /^(?:[a-z0-9-]+\.)*suno\.com$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HANDLE = /^@[a-z0-9_.-]{2,40}$/i;

export function canonicalUrl(kind: RefKind, id: string): string {
  return kind === 'profile' ? `https://suno.com/${id}` : `https://suno.com/${kind}/${id}`;
}

function classify(raw: string): { kind: RefKind; id: string } | { reason: string } {
  // Markdown, HTML and chat exports wrap links in punctuation. Pull the URL out
  // first; only if there is none do we treat the whole line as a bare id.
  const embedded = raw.match(/https?:\/\/[^\s)\]>"']+/i);
  const token = (embedded ? embedded[0] : raw)
    .replace(/^[<("'[]+|[>)"'\]]+$/g, '')
    .replace(/[,;.]+$/, '');

  if (UUID.test(token)) return { kind: 'song', id: token.toLowerCase() };
  if (HANDLE.test(token)) return { kind: 'profile', id: token.toLowerCase() };

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(token) ? token : `https://${token}`);
  } catch {
    return { reason: 'not a URL or a song id' };
  }

  if (!HOST.test(url.hostname)) return { reason: `not a suno.com host (${url.hostname})` };

  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { reason: 'host root, no song, playlist or profile' };

  const [head = '', second] = parts;
  const lower = head.toLowerCase();

  if (lower === 'song' || lower === 'playlist') {
    if (!second) return { reason: `/${lower} without an id` };
    if (!UUID.test(second)) return { reason: `/${lower} id is not a uuid` };
    return { kind: lower as RefKind, id: second.toLowerCase() };
  }

  if (head.startsWith('@')) {
    if (!HANDLE.test(head)) return { reason: 'profile handle is malformed' };
    return { kind: 'profile', id: head.toLowerCase() };
  }

  if (lower === 'profile' && second && HANDLE.test(second)) {
    return { kind: 'profile', id: second.toLowerCase() };
  }

  return { reason: `unrecognised suno path (/${parts.join('/')})` };
}

export function parseLinks(input: string): ParseLinksResult {
  const lines = (input ?? '')
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const refs: SongRef[] = [];
  const invalid: InvalidEntry[] = [];
  const duplicates: string[] = [];
  const seen = new Set<string>();

  lines.forEach((raw, index) => {
    const outcome = classify(raw);
    if ('reason' in outcome) {
      invalid.push({ index, raw, reason: outcome.reason });
      return;
    }
    const key = `${outcome.kind}:${outcome.id}`;
    if (seen.has(key)) {
      duplicates.push(raw);
      return;
    }
    seen.add(key);
    refs.push({ index, kind: outcome.kind, id: outcome.id, canonicalUrl: canonicalUrl(outcome.kind, outcome.id) });
  });

  return { refs, invalid, duplicates, total: lines.length };
}

export function summarizeLinks(result: ParseLinksResult): string {
  const songs = result.refs.filter((ref) => ref.kind === 'song').length;
  const playlists = result.refs.filter((ref) => ref.kind === 'playlist').length;
  const profiles = result.refs.filter((ref) => ref.kind === 'profile').length;
  const parts = [`${songs} song${songs === 1 ? '' : 's'}`, `${playlists} playlist${playlists === 1 ? '' : 's'}`, `${profiles} profile${profiles === 1 ? '' : 's'}`];
  const tail: string[] = [];
  if (result.duplicates.length > 0) tail.push(`${result.duplicates.length} duplicate${result.duplicates.length === 1 ? '' : 's'} skipped`);
  if (result.invalid.length > 0) tail.push(`${result.invalid.length} line${result.invalid.length === 1 ? '' : 's'} could not be read`);
  return `${parts.join(', ')}${tail.length ? ` — ${tail.join(', ')}` : ''}`;
}
