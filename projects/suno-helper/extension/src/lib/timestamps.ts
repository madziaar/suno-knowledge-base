/**
 * Lyrics → timed subtitle files (LRC / SRT / VTT).
 *
 * **What this is not:** forced alignment. We never hear the audio. Unless the
 * caller supplies real timings, every cue here is *distributed* across the
 * track in proportion to how long each line is likely to take to sing. That is
 * a useful starting point for a lyric video and a lie if presented as
 * transcription, so the API makes the difference explicit: estimated cues carry
 * `estimated: true` and the exporters write a comment saying so.
 *
 * Two real uses of the same primitives:
 *  - **Import** an existing `.lrc` (a real timing) and re-export, optionally
 *    shifted or rescaled to a different audio duration.
 *  - **Tap** in the popup: each tap is a real timestamp captured from a human
 *    ear, which beats any estimator we could write without the audio.
 */

export interface Cue {
  /** 1-based position in the file. */
  readonly index: number;
  readonly start: number;
  readonly end: number;
  readonly text: string;
  readonly estimated: boolean;
}

export interface TimingOptions {
  /** Total audio duration. Cues are packed into `[offset, duration]`. */
  readonly durationSeconds: number;
  readonly offsetSeconds?: number;
  /** Keep `[Chorus]`-style headings as cues instead of dropping them. */
  readonly keepSectionTags?: boolean;
  /** Floor for any single cue, so a two-word line is not flashed. */
  readonly minCueSeconds?: number;
  /** Leave this much of the tail empty (a real track usually fades). */
  readonly tailSeconds?: number;
}

export const DEFAULT_MIN_CUE = 0.8;
const SECTION_TAG = /^\s*[[(【]\s*[^\])】]{1,40}\s*[\])】]\s*$/;

/**
 * Rough syllable count. Latin script counts vowel groups (`beau-ti-ful` → 3),
 * CJK counts characters (each is a syllable), and anything else counts words.
 * Wrong in the margins, close enough to order lines by length.
 */
export function estimateSyllables(line: string): number {
  const text = line.trim();
  if (!text) return 0;
  const cjk = text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g)?.length ?? 0;
  const latin = text
    .replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g, ' ')
    .toLowerCase();
  const groups = latin.match(/[aeiouyà-öø-ÿ]+/g)?.length ?? 0;
  const words = latin.split(/[\s\-—–.,;:!?'"()]+/).filter(Boolean).length;
  if (cjk > 0) return cjk + groups;
  return Math.max(groups, words);
}

/** Split into singable lines, dropping blanks and (by default) section headings. */
export function toLines(lyrics: string, keepSectionTags = false): string[] {
  return lyrics
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => (keepSectionTags ? true : !SECTION_TAG.test(line)));
}

/** `mm:ss.xx`, the format LRC uses. Hours are not a thing for a song. */
export function formatLrcStamp(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const rest = clamped - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${rest.toFixed(2).padStart(5, '0')}`;
}

/** `HH:MM:SS,mmm` for SRT, `HH:MM:SS.mmm` for WebVTT. */
export function formatClock(seconds: number, separator: ',' | '.' = ','): string {
  const clamped = Math.max(0, seconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = Math.floor(clamped % 60);
  const millis = Math.round((clamped - Math.floor(clamped)) * 1000);
  const pad = (value: number, width = 2) => String(value).padStart(width, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}${separator}${pad(millis, 3)}`;
}

/**
 * Spread every line across the track, proportional to its syllable count.
 *
 * The floor is `minCueSeconds`; if honouring it would overflow the duration we
 * shrink it instead (and say so by returning cue ends clamped to the duration).
 * Better a slightly short cue than a subtitle that starts after the song ends.
 */
export function distributeCues(lyrics: string, options: TimingOptions): Cue[] {
  const lines = toLines(lyrics, options.keepSectionTags ?? false);
  if (lines.length === 0) return [];

  const start = Math.max(0, options.offsetSeconds ?? 0);
  const tail = Math.max(0, options.tailSeconds ?? 0);
  const available = Math.max(0.5, options.durationSeconds - start - tail);

  const weights = lines.map((line) => Math.max(1, estimateSyllables(line)));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const minCue = options.minCueSeconds ?? DEFAULT_MIN_CUE;
  // If the floor cannot fit, the floor loses.
  const floor = Math.min(minCue, available / lines.length);

  // One pass of water-filling: long lines shrink to give short lines their floor.
  let durations = weights.map((weight) => (weight / totalWeight) * available);
  const starved = durations.map((value, i) => (value < floor ? i : -1)).filter((i) => i >= 0);
  if (starved.length > 0) {
    const taken = starved.length * floor;
    const remaining = available - taken;
    const restWeight = weights.reduce((sum, weight, i) => (starved.includes(i) ? sum : sum + weight), 0);
    durations = durations.map((value, i) =>
      starved.includes(i) ? floor : restWeight > 0 ? (weights[i]! / restWeight) * remaining : floor,
    );
  }

  const cues: Cue[] = [];
  let cursor = start;
  for (let i = 0; i < lines.length; i += 1) {
    const length = durations[i] ?? floor;
    const end = Math.min(options.durationSeconds, cursor + length);
    cues.push({
      index: i + 1,
      start: Number(cursor.toFixed(3)),
      end: Number(Math.max(cursor + 0.05, end).toFixed(3)),
      text: lines[i]!,
      estimated: true,
    });
    cursor = end;
    if (cursor >= options.durationSeconds) {
      // Ran out of track: every remaining line gets a zero-length cue at the
      // very end rather than a timestamp past the file.
      for (let j = i + 1; j < lines.length; j += 1) {
        cues.push({
          index: j + 1,
          start: options.durationSeconds,
          end: options.durationSeconds,
          text: lines[j]!,
          estimated: true,
        });
      }
      break;
    }
  }
  return cues;
}

/** Parse `[mm:ss.xx]` lines. Returns cues sorted by start, `estimated: false`. */
export function parseLrc(lrc: string): Cue[] {
  const stamps: { start: number; text: string }[] = [];
  for (const raw of lrc.replace(/\r\n?/g, '\n').split('\n')) {
    const matches = [...raw.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    if (matches.length === 0) continue;
    const text = raw.replace(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g, '').trim();
    if (!text) continue;
    for (const match of matches) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const frac = match[3] ? Number(`0.${match[3]}`) : 0;
      stamps.push({ start: minutes * 60 + seconds + frac, text });
    }
  }
  stamps.sort((a, b) => a.start - b.start);
  return stamps.map((stamp, i) => ({
    index: i + 1,
    start: stamp.start,
    end: stamps[i + 1]?.start ?? stamp.start,
    text: stamp.text,
    estimated: false,
  }));
}

/** Shift every cue, and optionally stretch the whole set to a new duration. */
export function retime(cues: readonly Cue[], options: { shiftSeconds?: number; scaleTo?: number }): Cue[] {
  if (cues.length === 0) return [];
  const first = cues[0]!.start;
  const last = cues[cues.length - 1]!.end;
  const span = Math.max(0.001, last - first);
  const scale = options.scaleTo && options.scaleTo > 0 ? options.scaleTo / span : 1;
  const shift = options.shiftSeconds ?? 0;
  return cues.map((cue, i) => ({
    ...cue,
    index: i + 1,
    start: Number(((cue.start - first) * scale + shift).toFixed(3)),
    end: Number(((cue.end - first) * scale + shift).toFixed(3)),
  }));
}

export interface ExportMeta {
  readonly title?: string;
  readonly artist?: string;
  readonly album?: string;
}

export function toLrc(cues: readonly Cue[], meta: ExportMeta = {}): string {
  const head: string[] = [];
  if (meta.title) head.push(`[ti:${meta.title}]`);
  if (meta.artist) head.push(`[ar:${meta.artist}]`);
  if (meta.album) head.push(`[al:${meta.album}]`);
  if (cues.some((cue) => cue.estimated)) head.push('[re:Suno Helper — estimated timings, not transcription]');
  head.push('[by:Suno Helper]');
  const body = cues.map((cue) => `[${formatLrcStamp(cue.start)}]${cue.text}`);
  return [...head, ...body].join('\n') + '\n';
}

export function toSrt(cues: readonly Cue[]): string {
  return (
    cues
      .map(
        (cue) =>
          `${cue.index}\n${formatClock(cue.start, ',')} --> ${formatClock(cue.end, ',')}\n${cue.text}`,
      )
      .join('\n\n') + '\n'
  );
}

export function toVtt(cues: readonly Cue[]): string {
  const head = ['WEBVTT', ''];
  const body = cues.map(
    (cue) => `${cue.index}\n${formatClock(cue.start, '.')} --> ${formatClock(cue.end, '.')}\n${cue.text}`,
  );
  return [...head, ...body].join('\n\n') + '\n';
}

/** Convert raw tap times (seconds, ascending) into cues with real timings. */
export function cuesFromTaps(taps: readonly number[], lines: readonly string[], totalSeconds: number): Cue[] {
  const times = [...taps].sort((a, b) => a - b);
  return times.map((start, i) => ({
    index: i + 1,
    start: Number(start.toFixed(3)),
    end: Number((times[i + 1] ?? totalSeconds).toFixed(3)),
    text: lines[i] ?? '',
    estimated: false,
  }));
}
