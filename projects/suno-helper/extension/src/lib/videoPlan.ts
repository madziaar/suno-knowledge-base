/**
 * Plan for the lyric-video studio, minus the canvas.
 *
 * Everything that can be decided without a GPU lives here: which cue is on
 * screen at frame N, how the text is wrapped, which theme applies. The studio
 * page draws the result and hands frames to `MediaRecorder`. That split means
 * the geometry is unit-tested and the untestable part is fifteen lines of
 * `fillText`.
 */

import type { Cue } from './timestamps';

export interface VideoTheme {
  readonly id: string;
  readonly name: string;
  readonly background: string;
  readonly foreground: string;
  readonly accent: string;
}

export const THEMES: readonly VideoTheme[] = [
  { id: 'midnight', name: 'Midnight', background: '#0b0f14', foreground: '#f5f7fa', accent: '#4ade80' },
  { id: 'paper', name: 'Paper', background: '#f7f4ec', foreground: '#1a1a1a', accent: '#b45309' },
  { id: 'neon', name: 'Neon', background: '#14001f', foreground: '#ffe9ff', accent: '#e879f9' },
  { id: 'ocean', name: 'Ocean', background: '#04202c', foreground: '#e6f7ff', accent: '#38bdf8' },
];

export interface VideoOptions {
  readonly width?: number;
  readonly height?: number;
  readonly fps?: number;
  readonly theme?: VideoTheme;
  /** Refuse to plan more than this many frames; a 3-minute 30 fps video is 5400. */
  readonly maxFrames?: number;
}

export interface PlannedFrame {
  readonly index: number;
  /** Seconds from the start of the video. */
  readonly time: number;
  readonly cueIndex: number | null;
  readonly lines: readonly string[];
}

export interface VideoPlan {
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  readonly durationSeconds: number;
  readonly totalFrames: number;
  readonly theme: VideoTheme;
  readonly frames: readonly PlannedFrame[];
  readonly warnings: readonly string[];
}

export const MAX_FRAMES = 30_000;

/** Greedy wrap at `maxChars`, never splitting a word that fits on its own line. */
export function wrapLine(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function activeCue(cues: readonly Cue[], time: number): Cue | null {
  // Linear scan is fine: a song has tens of cues and this runs once per frame
  // only in the preview path, where a loop over 40 items is free.
  for (const cue of cues) {
    if (time >= cue.start && time < cue.end) return cue;
  }
  return null;
}

/**
 * Build the frame table.
 *
 * Frames are planned at a coarse resolution on purpose: a cue boundary that
 * lands mid-frame is snapped to the next frame, and we emit only the frames
 * where something changes plus a heartbeat every second, so a long video does
 * not allocate hundreds of thousands of objects in a popup.
 */
export function planLyricVideo(cues: readonly Cue[], options: VideoOptions = {}): VideoPlan {
  const width = options.width ?? 1280;
  const height = options.height ?? 720;
  const fps = Math.min(60, Math.max(10, options.fps ?? 30));
  const theme = options.theme ?? THEMES[0]!;
  const maxFrames = Math.min(options.maxFrames ?? MAX_FRAMES, MAX_FRAMES);

  const warnings: string[] = [];
  const duration = cues.reduce((end, cue) => Math.max(end, cue.end), 0);
  if (duration <= 0) warnings.push('No cues — nothing to render.');
  if (cues.some((cue) => cue.estimated)) {
    warnings.push('Timings are estimated, so the video will drift against the real vocal.');
  }

  const charsPerLine = Math.max(12, Math.floor(width / (height * 0.055)));
  const frames: PlannedFrame[] = [];
  const totalFrames = Math.ceil(duration * fps);
  if (totalFrames > maxFrames) {
    warnings.push(`A ${Math.round(duration)}s video at ${fps} fps is ${totalFrames} frames; capped at ${maxFrames}.`);
  }
  const lastIndex = Math.min(totalFrames, maxFrames);

  for (let index = 0; index < lastIndex; index += 1) {
    const time = index / fps;
    if (index % fps !== 0 && !cueStartsAt(cues, time, 1 / fps)) continue;
    const cue = activeCue(cues, time);
    frames.push({
      index,
      time: Number(time.toFixed(3)),
      cueIndex: cue?.index ?? null,
      lines: cue ? wrapLine(cue.text, charsPerLine) : [],
    });
  }

  return {
    width,
    height,
    fps,
    durationSeconds: Number(duration.toFixed(3)),
    totalFrames: lastIndex,
    theme,
    frames,
    warnings,
  };
}

function cueStartsAt(cues: readonly Cue[], time: number, epsilon: number): boolean {
  return cues.some((cue) => Math.abs(cue.start - time) < epsilon);
}

/** Seconds → `m:ss`, for the studio's transport bar. */
export function clock(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(Math.floor(safe % 60)).padStart(2, '0')}`;
}
