/** Small shared text helpers. Pure, allocation-light, used by every panel. */

const SEPARATORS = /[,;|/]+/g;

/** Split a tag-ish string on every separator the tools accept. */
export function splitTags(input: string): string[] {
  return input
    .split(SEPARATORS)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/** Deduplicate case-insensitively, keeping the first spelling seen. */
export function uniqueCaseInsensitive(items: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function titleCase(input: string): string {
  return input.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function slugify(input: string): string {
  return collapseWhitespace(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/** `m:ss` for a duration in seconds; `h:mm:ss` past an hour. */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value: number) => value.toString().padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}
