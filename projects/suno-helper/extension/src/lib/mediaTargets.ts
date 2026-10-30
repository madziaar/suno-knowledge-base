/**
 * Find the media a **public** page points at.
 *
 * Scope, stated plainly because it is the part people dispute: this reads the
 * Open Graph / JSON-LD / `<audio>` tags of a page the user is already looking
 * at and returns the URLs the page itself publishes. It does not call a private
 * API, does not mint signed URLs, and never runs inside the batch queue. Saving
 * is one click, on one item, into the user's own downloads folder.
 *
 * Anything that is not `http(s)` is dropped — `data:` and `blob:` URIs here
 * would mean we were smuggling bytes through the extension rather than letting
 * the browser download what the page offered.
 */

export type MediaKind = 'audio' | 'video' | 'cover';

export interface MediaTarget {
  readonly kind: MediaKind;
  readonly url: string;
  readonly host: string;
  readonly filename: string;
  readonly source: 'og' | 'jsonld' | 'tag' | 'guess';
  /** Host is a Suno/CDN domain we have seen pages reference. */
  readonly trusted: boolean;
}

const HOST_HINTS = ['suno.ai', 'suno.com', 'sunocdn.com', 'cloudfront.net', 'amazonaws.com', 'akamaized.net'];
const AUDIO_EXT = /\.(mp3|m4a|wav|flac|ogg|opus)(\?|#|$)/i;
const VIDEO_EXT = /\.(mp4|webm|mov)(\?|#|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)(\?|#|$)/i;

export function isTrustedHost(host: string): boolean {
  const lower = host.toLowerCase();
  return HOST_HINTS.some((hint) => lower === hint || lower.endsWith(`.${hint}`));
}

function parseUrl(value: string, base: string): URL | null {
  try {
    const url = new URL(value.trim(), base);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url;
  } catch {
    return null;
  }
}

/** Pull `<meta property=… content=…>` pairs without a DOM. */
function metaContent(html: string, property: string): string[] {
  const out: string[] = [];
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)\\s*=\\s*["']${property}["'][^>]*content\\s*=\\s*["']([^"']+)["']`,
    'gi',
  );
  for (const match of html.matchAll(pattern)) out.push(match[1]!);
  // Attribute order is not guaranteed; try the reverse order too.
  const reversed = new RegExp(
    `<meta[^>]+content\\s*=\\s*["']([^"']+)["'][^>]*(?:property|name)\\s*=\\s*["']${property}["']`,
    'gi',
  );
  for (const match of html.matchAll(reversed)) out.push(match[1]!);
  return out;
}

function jsonLdUrls(html: string): { url: string; kind: MediaKind }[] {
  const out: { url: string; kind: MediaKind }[] = [];
  const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    const text = block[1] ?? '';
    for (const match of text.matchAll(/"(?:contentUrl|audio|video|thumbnailUrl|image)"\s*:\s*"([^"]+)"/gi)) {
      const key = match[0].toLowerCase();
      const value = match[1]!;
      const kind: MediaKind = key.includes('audio')
        ? 'audio'
        : key.includes('video')
          ? 'video'
          : 'cover';
      out.push({ url: value, kind });
    }
  }
  return out;
}

function tagSources(html: string): { url: string; kind: MediaKind }[] {
  const out: { url: string; kind: MediaKind }[] = [];
  for (const match of html.matchAll(/<(audio|video|source)[^>]+src\s*=\s*["']([^"']+)["']/gi)) {
    out.push({ url: match[2]!, kind: match[1]!.toLowerCase() === 'audio' ? 'audio' : 'video' });
  }
  return out;
}

const slug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 80) || 'suno-track';

/** A filename the OS will accept, derived from the track title. */
export function safeFilename(title: string, kind: MediaKind, url: string): string {
  const urlExt = (url.split('?')[0] ?? '').match(/\.[a-z0-9]{2,4}$/i)?.[0]?.toLowerCase();
  const fallback = kind === 'audio' ? '.mp3' : kind === 'video' ? '.mp4' : '.jpg';
  const base = slug(title || 'suno-track');
  return `${base}${urlExt ?? fallback}`;
}

/**
 * Collect every candidate the page offers, de-duplicated by URL, best first.
 * `title` is only used for filenames; passing nothing is fine.
 */
export function findMediaTargets(html: string, pageUrl: string, title = ''): MediaTarget[] {
  const candidates: { url: string; kind: MediaKind; source: MediaTarget['source'] }[] = [];

  for (const value of metaContent(html, 'og:audio')) candidates.push({ url: value, kind: 'audio', source: 'og' });
  for (const value of metaContent(html, 'og:audio:url')) candidates.push({ url: value, kind: 'audio', source: 'og' });
  for (const value of metaContent(html, 'og:video')) candidates.push({ url: value, kind: 'video', source: 'og' });
  for (const value of metaContent(html, 'og:video:url')) candidates.push({ url: value, kind: 'video', source: 'og' });
  for (const value of metaContent(html, 'og:image')) candidates.push({ url: value, kind: 'cover', source: 'og' });
  for (const entry of jsonLdUrls(html)) candidates.push({ ...entry, source: 'jsonld' });
  for (const entry of tagSources(html)) candidates.push({ ...entry, source: 'tag' });

  // Last resort: URLs in the page body that look like media on a known host.
  for (const match of html.matchAll(/https?:\/\/[^\s"'<>\\]+/g)) {
    const value = match[0];
    const kind: MediaKind | null = AUDIO_EXT.test(value) ? 'audio' : VIDEO_EXT.test(value) ? 'video' : IMAGE_EXT.test(value) ? 'cover' : null;
    if (kind) candidates.push({ url: value, kind, source: 'guess' });
  }

  const seen = new Set<string>();
  const targets: MediaTarget[] = [];
  for (const candidate of candidates) {
    const parsed = parseUrl(candidate.url, pageUrl);
    if (!parsed) continue;
    // Normalise before de-duplicating: the same file is often linked with and
    // without a tracking query string.
    const key = `${candidate.kind}:${parsed.origin}${parsed.pathname}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({
      kind: candidate.kind,
      url: parsed.toString(),
      host: parsed.host,
      filename: safeFilename(title, candidate.kind, parsed.pathname),
      source: candidate.source,
      trusted: isTrustedHost(parsed.host),
    });
  }

  const rank = { og: 0, jsonld: 1, tag: 2, guess: 3 } as const;
  return targets.sort(
    (a, b) => Number(b.trusted) - Number(a.trusted) || rank[a.source] - rank[b.source],
  );
}

export function bestTarget(targets: readonly MediaTarget[], kind: MediaKind): MediaTarget | null {
  return targets.find((target) => target.kind === kind) ?? null;
}

/**
 * A playlist/profile page renders its tracks client-side, so there is nothing
 * to download from the HTML itself. Saying so beats returning an empty list
 * that reads as "this playlist has no songs".
 */
export function explainMissingTracks(kind: 'playlist' | 'profile'): string {
  return kind === 'playlist'
    ? 'Suno renders playlist pages client-side, so the track list is not in the HTML. Open the playlist, then use “Save” on each track — or run a batch capture first.'
    : 'Profile pages load their tracks client-side. Run a batch capture over the profile URL to collect what the page exposes, then export.';
}
