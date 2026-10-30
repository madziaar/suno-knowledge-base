/**
 * Capture records.
 *
 * A capture is what the backend learned about one Suno link. It is deliberately
 * allowed to be *partial*: a page that only gives us a title is still useful, and
 * saying so beats inventing a duration.
 */

import type { SongMeta } from './htmlMeta';
import type { RefKind } from './parseLinks';

export type CaptureStatus = 'ok' | 'partial' | 'manual' | 'failed';

export interface SongCapture {
  readonly id: string;
  readonly kind: RefKind;
  readonly url: string;
  readonly title: string;
  readonly creator: string;
  readonly durationSeconds: number | null;
  readonly imageUrl: string;
  readonly audioUrl: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly publishedAt: string;
  readonly status: CaptureStatus;
  readonly source: SongMeta['source'] | 'none';
  readonly fetchedAt: number;
  readonly error: string;
}

export interface CaptureOptions {
  readonly now?: number;
  readonly kind?: RefKind;
}

/**
 * Turn a page reading into a capture.
 *
 * `manual` is for playlist/profile links: their HTML carries a title but not the
 * track list, so we record what we know and refuse to pretend it is complete.
 */
export function buildCapture(meta: SongMeta, options: CaptureOptions = {}): SongCapture {
  const kind = options.kind ?? 'song';
  const now = options.now ?? Date.now();
  const status: CaptureStatus = !meta.found
    ? 'failed'
    : kind !== 'song'
      ? 'manual'
      : meta.source === 'jsonld'
        ? 'ok'
        : 'partial';

  return {
    id: meta.id || '',
    kind,
    url: meta.url,
    title: meta.title,
    creator: meta.creator,
    durationSeconds: meta.durationSeconds,
    imageUrl: meta.imageUrl,
    audioUrl: meta.audioUrl,
    description: meta.description,
    tags: [...meta.tags],
    publishedAt: meta.publishedAt,
    status,
    source: meta.found ? meta.source : 'none',
    fetchedAt: now,
    error: meta.found ? '' : 'no title found on the page',
  };
}

export function failedCapture(id: string, url: string, kind: RefKind, error: string, now = Date.now()): SongCapture {
  return {
    id,
    kind,
    url,
    title: '',
    creator: '',
    durationSeconds: null,
    imageUrl: '',
    audioUrl: '',
    description: '',
    tags: [],
    publishedAt: '',
    status: 'failed',
    source: 'none',
    fetchedAt: now,
    error,
  };
}

/** How complete a capture is, 0–1. Used to decide which duplicate to keep. */
export function captureScore(capture: SongCapture): number {
  let score = 0;
  if (capture.title) score += 3;
  if (capture.creator) score += 2;
  if (capture.durationSeconds !== null) score += 2;
  if (capture.audioUrl) score += 2;
  if (capture.imageUrl) score += 1;
  if (capture.tags.length) score += 1;
  if (capture.status === 'ok') score += 2;
  if (capture.status === 'failed') score -= 5;
  return score;
}

/** Merge two capture lists, keeping the richer record per id. */
export function mergeCaptures(existing: readonly SongCapture[], incoming: readonly SongCapture[]): SongCapture[] {
  const byKey = new Map<string, SongCapture>();
  for (const capture of [...existing, ...incoming]) {
    const key = `${capture.kind}:${capture.id || capture.url}`;
    const current = byKey.get(key);
    if (!current || captureScore(capture) >= captureScore(current)) byKey.set(key, capture);
  }
  return [...byKey.values()].sort((a, b) => b.fetchedAt - a.fetchedAt || a.url.localeCompare(b.url));
}

export interface CaptureStats {
  readonly total: number;
  readonly ok: number;
  readonly partial: number;
  readonly manual: number;
  readonly failed: number;
  readonly withAudio: number;
  readonly averageSeconds: number | null;
}

export function captureStats(captures: readonly SongCapture[]): CaptureStats {
  const withDuration = captures.filter((capture) => capture.durationSeconds !== null);
  const sum = withDuration.reduce((total, capture) => total + (capture.durationSeconds ?? 0), 0);
  return {
    total: captures.length,
    ok: captures.filter((capture) => capture.status === 'ok').length,
    partial: captures.filter((capture) => capture.status === 'partial').length,
    manual: captures.filter((capture) => capture.status === 'manual').length,
    failed: captures.filter((capture) => capture.status === 'failed').length,
    withAudio: captures.filter((capture) => capture.audioUrl).length,
    averageSeconds: withDuration.length === 0 ? null : Math.round(sum / withDuration.length),
  };
}

/** Rows for `toCsv` — flat, spreadsheet-friendly, no nested objects. */
export function toCaptureRows(captures: readonly SongCapture[]): Record<string, unknown>[] {
  return captures.map((capture) => ({
    id: capture.id,
    kind: capture.kind,
    title: capture.title,
    creator: capture.creator,
    duration_seconds: capture.durationSeconds ?? '',
    tags: capture.tags.join('|'),
    status: capture.status,
    source: capture.source,
    url: capture.url,
    image_url: capture.imageUrl,
    audio_url: capture.audioUrl,
    published_at: capture.publishedAt,
  }));
}
