/**
 * Read song metadata out of a public Suno page's HTML.
 *
 * Deliberately boring: Open Graph tags, `<title>`, and `application/ld+json`
 * blocks. No private API is called, no session cookie is touched, nothing is
 * guessed. If a page exposes none of these the caller gets `found: false` and
 * can fall back to the tab-capture path — it never gets invented data.
 */

export interface SongMeta {
  readonly url: string;
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly audioUrl: string;
  readonly durationSeconds: number | null;
  readonly publishedAt: string;
  readonly tags: readonly string[];
  /** Which signal produced the title — useful when a page changes shape. */
  readonly source: 'jsonld' | 'og' | 'title' | 'none';
  readonly found: boolean;
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  nbsp: ' ',
  '#39': "'",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, name: string) => {
    const key = name.toLowerCase();
    if (key.startsWith('#x')) return String.fromCodePoint(Number.parseInt(key.slice(2), 16) || 32);
    if (key.startsWith('#')) return String.fromCodePoint(Number.parseInt(key.slice(1), 10) || 32);
    return ENTITIES[key] ?? match;
  });
}

/** Parse `<meta …>` tags into a lowercase name/property → content map. */
export function parseMetaTags(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  const tagPattern = /<meta\s+[^>]*>/gi;
  for (const tag of html.match(tagPattern) ?? []) {
    const attrs: Record<string, string> = {};
    const attrPattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
    let match: RegExpExecArray | null;
    while ((match = attrPattern.exec(tag)) !== null) {
      const name = match[1]?.toLowerCase();
      const value = match[2] ?? match[3] ?? match[4] ?? '';
      if (name) attrs[name] = decodeEntities(value);
    }
    const key = (attrs.property ?? attrs.name ?? attrs.itemprop ?? '').toLowerCase();
    if (key && attrs.content !== undefined) out[key] = attrs.content;
  }
  return out;
}

function parseLdJson(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const body = match[1]?.trim();
    if (!body) continue;
    try {
      const parsed: unknown = JSON.parse(body);
      const push = (value: unknown) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) blocks.push(value as Record<string, unknown>);
      };
      if (Array.isArray(parsed)) parsed.forEach(push);
      else push(parsed);
    } catch {
      // A malformed block is not an error worth failing the capture over.
    }
  }
  return blocks;
}

/** ISO-8601 (`PT3M12S`) or a bare number of seconds. */
export function parseDuration(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value !== 'string') return null;
  const iso = value.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i);
  if (iso) {
    const [, days, hours, minutes, seconds] = iso;
    const total = Number(days ?? 0) * 86400 + Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0);
    return total > 0 ? Math.round(total) : null;
  }
  const numeric = value.match(/^(\d+(?:\.\d+)?)\s*s?$/i);
  return numeric?.[1] ? Math.round(Number(numeric[1])) : null;
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (Array.isArray(value)) {
      const nested = firstString(...value);
      if (nested) return nested;
    }
  }
  return '';
}

function artistName(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return firstString(record.name, record['@id']);
  }
  if (Array.isArray(value)) return artistName(value[0]);
  return '';
}

/** Song id from a canonical Suno URL, when there is one. */
export function idFromUrl(url: string): string {
  const match = url.match(/\/song\/([0-9a-f-]{36})/i);
  return match?.[1]?.toLowerCase() ?? '';
}

export function extractSongFromHtml(html: string, url: string): SongMeta {
  const source = html ?? '';
  const meta = parseMetaTags(source);
  const blocks = parseLdJson(source);
  const song = blocks.find((block) => {
    const type = String(block['@type'] ?? '').toLowerCase();
    return type.includes('song') || type.includes('musicrecording');
  });
  const titleTag = decodeEntities(source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '');
  const cleanedTitleTag = titleTag.replace(/\s*[|·—-]\s*Suno.*$/i, '').trim();

  const title = firstString(song?.name, meta['og:title'], meta['twitter:title'], cleanedTitleTag);
  const creator =
    artistName(song?.byArtist) ||
    firstString(meta['music:musician'], meta['og:site_name'] === 'Suno' ? '' : meta['og:site_name'], meta['twitter:creator']);
  const audio =
    firstString(song?.audio) ||
    firstString(song?.contentUrl) ||
    firstString(meta['og:audio'], meta['og:audio:url'], meta['twitter:player:stream']);

  const source_kind: SongMeta['source'] = song ? 'jsonld' : meta['og:title'] ? 'og' : cleanedTitleTag ? 'title' : 'none';

  return {
    url: meta['og:url'] || url,
    id: idFromUrl(meta['og:url'] || url),
    title,
    creator,
    description: firstString(song?.description, meta['og:description'], meta['description']),
    imageUrl: firstString(song?.image, meta['og:image'], meta['twitter:image']),
    audioUrl: audio,
    durationSeconds: parseDuration(song?.duration ?? meta['music:duration'] ?? meta['og:audio:duration']),
    publishedAt: firstString(song?.datePublished, meta['article:published_time']),
    tags: (firstString(meta['music:genre'], song?.genre) || '')
      .split(/[,;|]/)
      .map((tag) => tag.trim())
      .filter(Boolean),
    source: source_kind,
    found: Boolean(title),
  };
}
