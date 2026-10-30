/**
 * Profile / playlist analytics.
 *
 * The competitor downloads a profile and then analyses it. We already hold the
 * captures — these are the numbers, computed locally, with nothing sent
 * anywhere. Small (n < 5) samples are reported with a `thin: true` flag rather
 * than dressed up as a pattern.
 */

export interface AnalysableSong {
  readonly title: string;
  readonly creator: string;
  readonly durationSeconds: number | null;
  readonly tags: readonly string[];
  readonly url?: string;
}

export interface NamedCount {
  readonly name: string;
  readonly count: number;
}

export interface DurationBucket {
  readonly label: string;
  readonly minSeconds: number;
  readonly maxSeconds: number;
  readonly count: number;
}

export interface Analytics {
  readonly count: number;
  readonly thin: boolean;
  readonly withDuration: number;
  readonly missingDuration: number;
  readonly totalSeconds: number;
  readonly meanSeconds: number;
  readonly medianSeconds: number;
  readonly minSeconds: number;
  readonly maxSeconds: number;
  readonly creators: readonly NamedCount[];
  readonly tags: readonly NamedCount[];
  readonly duplicates: readonly NamedCount[];
  readonly buckets: readonly DurationBucket[];
}

export const BUCKET_EDGES: readonly { readonly label: string; readonly minSeconds: number; readonly maxSeconds: number }[] = [
  { label: '< 1:00', minSeconds: 0, maxSeconds: 60 },
  { label: '1:00–2:00', minSeconds: 60, maxSeconds: 120 },
  { label: '2:00–3:00', minSeconds: 120, maxSeconds: 180 },
  { label: '3:00–4:00', minSeconds: 180, maxSeconds: 240 },
  { label: '4:00–5:00', minSeconds: 240, maxSeconds: 300 },
  { label: '≥ 5:00', minSeconds: 300, maxSeconds: Number.POSITIVE_INFINITY },
];

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Count occurrences, normalised for case and whitespace, sorted desc then a→z. */
export function tally(values: readonly string[]): NamedCount[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const raw of values) {
    const name = raw.trim().replace(/\s+/g, ' ');
    if (!name) continue;
    const key = name.toLowerCase();
    const existing = counts.get(key);
    if (existing) counts.set(key, { name: existing.name, count: existing.count + 1 });
    else counts.set(key, { name, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function durationBuckets(durations: readonly number[]): DurationBucket[] {
  return BUCKET_EDGES.map((edge) => ({
    label: edge.label,
    minSeconds: edge.minSeconds,
    maxSeconds: edge.maxSeconds,
    count: durations.filter((value) => value >= edge.minSeconds && value < edge.maxSeconds).length,
  }));
}

/**
 * Summarise a set of captures.
 *
 * Tags are split on commas first: Suno returns a style string, and counting the
 * whole string would make every song its own unique tag.
 */
export function analyzeSongs(songs: readonly AnalysableSong[]): Analytics {
  const durations = songs
    .map((song) => song.durationSeconds)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0);

  const total = durations.reduce((sum, value) => sum + value, 0);
  const tags = songs.flatMap((song) =>
    song.tags.flatMap((tag) => tag.split(/[,;|]/).map((part) => part.trim()).filter(Boolean)),
  );

  const titleKeys = songs.map((song) => song.title.trim().toLowerCase()).filter(Boolean);

  return {
    count: songs.length,
    thin: songs.length > 0 && songs.length < 5,
    withDuration: durations.length,
    missingDuration: songs.length - durations.length,
    totalSeconds: Math.round(total),
    meanSeconds: durations.length > 0 ? round1(total / durations.length) : 0,
    medianSeconds: round1(median(durations)),
    minSeconds: durations.length > 0 ? Math.round(Math.min(...durations)) : 0,
    maxSeconds: durations.length > 0 ? Math.round(Math.max(...durations)) : 0,
    creators: tally(songs.map((song) => song.creator)),
    tags: tally(tags).slice(0, 12),
    duplicates: tally(titleKeys).filter((entry) => entry.count > 1),
    buckets: durationBuckets(durations),
  };
}

/** `3:42` — the format people read, not `222`. */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, '0')}`;
}

export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.round(seconds / 60)} min`;
  return `${hours.toFixed(1)} h`;
}
