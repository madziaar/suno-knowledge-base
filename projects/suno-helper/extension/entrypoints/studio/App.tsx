/**
 * The lyric-video studio — a full page, not the popup.
 *
 * A popup dies the instant the user clicks outside it, and a `MediaRecorder`
 * cannot survive that. So the popup edits and writes a draft; this page reads
 * it, draws frames on a canvas, and records them.
 *
 * Audio is optional and **local**: if the user picks a file, it is added to the
 * recorded stream through an object URL. Nothing is uploaded, and no audio is
 * ever fetched from Suno — the video is visuals only unless the user brought
 * their own file.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { DRAFT_KEY, EMPTY_DRAFT, migrateDraft, type StudioDraft } from '../../src/lib/draft';
import { downloadText, safeDownloadName, stampedName } from '../../src/lib/download';
import { DEFAULT_PACE } from '../../src/lib/estimateDuration';
import { distributeCues, parseLrc, toLrc, toSrt, toVtt, type Cue } from '../../src/lib/timestamps';
import { THEMES, activeCue, clock, planLyricVideo, wrapLine, type VideoTheme } from '../../src/lib/videoPlan';

const SIZES = [
  { id: '720p', label: '1280 × 720', width: 1280, height: 720 },
  { id: '1080p', label: '1920 × 1080', width: 1920, height: 1080 },
  { id: 'vertical', label: '1080 × 1920', width: 1080, height: 1920 },
  { id: 'square', label: '1080 × 1080', width: 1080, height: 1080 },
];

export default function App() {
  const [draft, setDraft] = useState<StudioDraft>(EMPTY_DRAFT);
  const [themeId, setThemeId] = useState('midnight');
  const [sizeId, setSizeId] = useState('720p');
  const [fps, setFps] = useState(30);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    void (async () => {
      const stored = await chrome.storage.local.get(DRAFT_KEY);
      const loaded = migrateDraft(stored[DRAFT_KEY]);
      setDraft(loaded);
      setThemeId(loaded.themeId);
      if (loaded.cues.length === 0 && loaded.lyrics) {
        setStatus('No timings yet — using the duration estimate.');
      }
    })();
  }, []);

  const size = SIZES.find((entry) => entry.id === sizeId) ?? SIZES[0]!;
  const theme = THEMES.find((entry) => entry.id === themeId) ?? THEMES[0]!;

  const cues = useMemo(() => {
    if (draft.cues.length > 0) return draft.cues;
    // Fall back to a duration estimate so the page is never empty.
    const seconds = Math.max(30, draft.lyrics.split('\n').filter(Boolean).length * 4.5);
    return distributeCues(draft.lyrics, { durationSeconds: seconds });
  }, [draft]);

  const plan = useMemo(
    () => planLyricVideo(cues, { fps, width: size.width, height: size.height, theme }),
    [cues, fps, size, theme],
  );

  const duration = plan.durationSeconds;

  // Static preview: draw the cue at `previewAt`.
  const [previewAt, setPreviewAt] = useState(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawFrame(canvas, cues, theme, previewAt);
  }, [plan, theme, previewAt]);

  async function start() {
    if (recording || cues.length === 0) return;
    setRecording(true);
    setProgress(0);
    cancelRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const mime = pickMime();
    if (!mime) {
      setStatus('This browser has no MediaRecorder video support.');
      setRecording(false);
      return;
    }

    const stream = canvas.captureStream(fps);
    if (audioUrl && audioRef.current) {
      const audio = audioRef.current;
      const audioStream = (audio as HTMLAudioElement & { captureStream?: () => MediaStream }).captureStream?.();
      audioStream?.getAudioTracks().forEach((track) => stream.addTrack(track));
      audio.currentTime = 0;
      audio.play().catch(() => undefined);
    }

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bitrate(size) });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    const finished = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
    });
    recorder.start(250);

    const startedAt = performance.now();
    await new Promise<void>((resolve) => {
      const step = () => {
        const elapsed = (performance.now() - startedAt) / 1000;
        drawFrame(canvas, cues, theme, elapsed);
        setProgress(Math.min(1, elapsed / Math.max(0.1, duration)));
        if (cancelRef.current || elapsed >= duration) {
          resolve();
          return;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    recorder.stop();
    audioRef.current?.pause();
    const blob = await finished;
    setRecording(false);
    setProgress(1);

    const extension = mime.includes('mp4') ? 'mp4' : 'webm';
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = stampedName(safeDownloadName(draft.title || 'lyric-video'), extension);
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setStatus(`Rendered ${clock(duration)} of ${extension.toUpperCase()} — ${Math.round(blob.size / 1024)} kB.`);
  }

  function stop() {
    cancelRef.current = true;
  }

  function onAudioFile(file: File | undefined) {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (!file) {
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setStatus(`Audio: ${file.name} — added to the recording, never uploaded.`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Lyric video studio</h1>
          <p className="text-[11px] text-neutral-500">
            {cues.length} cue{cues.length === 1 ? '' : 's'} · {clock(duration)} · pace {DEFAULT_PACE} ·
            everything renders on this device
          </p>
        </div>
        <span className="text-[11px] text-neutral-600">{draft.title}</span>
      </header>

      {plan.warnings.length > 0 ? (
        <ul className="space-y-0.5 rounded border border-amber-900/40 bg-amber-950/20 p-2">
          {plan.warnings.map((warning) => (
            <li key={warning} className="text-[11px] text-amber-300/90">
              {warning}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={size.width}
            height={size.height}
            className="w-full rounded border border-neutral-800 bg-black"
            style={{ aspectRatio: `${size.width} / ${size.height}` }}
          />
          <input
            type="range"
            min={0}
            max={Math.max(0.1, duration)}
            step={0.05}
            value={previewAt}
            onChange={(event) => setPreviewAt(Number(event.target.value))}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void start()}
              disabled={recording || cues.length === 0}
              className="rounded bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-40"
            >
              {recording ? 'Recording…' : 'Render video'}
            </button>
            <button
              type="button"
              onClick={stop}
              disabled={!recording}
              className="rounded bg-neutral-800 px-3 py-1.5 text-[12px] text-neutral-200 disabled:opacity-40"
            >
              Stop
            </button>
            <span className="text-[11px] text-neutral-500">{clock(previewAt)} / {clock(duration)}</span>
          </div>
          {recording || progress > 0 ? (
            <div className="h-1 w-full overflow-hidden rounded bg-neutral-800">
              <div className="h-full bg-emerald-500" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          ) : null}
          {status ? <p className="text-[11px] text-neutral-400">{status}</p> : null}
        </div>

        <aside className="space-y-3">
          <section className="space-y-1">
            <h2 className="text-[10px] uppercase tracking-wide text-neutral-500">Theme</h2>
            <div className="grid grid-cols-2 gap-1">
              {THEMES.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setThemeId(entry.id)}
                  className={`rounded px-2 py-1 text-[11px] ${entry.id === themeId ? 'ring-1 ring-emerald-500' : ''}`}
                  style={{ background: entry.background, color: entry.foreground }}
                >
                  {entry.name}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-1">
            <h2 className="text-[10px] uppercase tracking-wide text-neutral-500">Canvas</h2>
            <select
              value={sizeId}
              onChange={(event) => setSizeId(event.target.value)}
              className="w-full rounded bg-neutral-900 px-2 py-1 text-[11px]"
            >
              {SIZES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <select
              value={fps}
              onChange={(event) => setFps(Number(event.target.value))}
              className="w-full rounded bg-neutral-900 px-2 py-1 text-[11px]"
            >
              {[24, 30, 60].map((value) => (
                <option key={value} value={value}>
                  {value} fps
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-1">
            <h2 className="text-[10px] uppercase tracking-wide text-neutral-500">Your audio (optional)</h2>
            <input
              type="file"
              accept="audio/*"
              onChange={(event) => onAudioFile(event.target.files?.[0])}
              className="w-full text-[10px] text-neutral-400"
            />
            {audioUrl ? <audio ref={audioRef} src={audioUrl} controls className="w-full" /> : null}
            <p className="text-[10px] leading-snug text-neutral-600">
              A local file is muxed into the recording by the browser. Nothing is sent anywhere, and no
              audio is ever pulled from Suno.
            </p>
          </section>

          <section className="space-y-1">
            <h2 className="text-[10px] uppercase tracking-wide text-neutral-500">Timings out</h2>
            <div className="flex flex-wrap gap-1">
              <MiniButton onClick={() => downloadText(`${draft.title}.lrc`, toLrc(cues, { title: draft.title }))}>
                LRC
              </MiniButton>
              <MiniButton onClick={() => downloadText(`${draft.title}.srt`, toSrt(cues))}>SRT</MiniButton>
              <MiniButton onClick={() => downloadText(`${draft.title}.vtt`, toVtt(cues))}>VTT</MiniButton>
            </div>
            <input
              type="file"
              accept=".lrc,text/plain"
              onChange={(event) => void importLrc(event.target.files?.[0])}
              className="w-full text-[10px] text-neutral-400"
            />
            <p className="text-[10px] leading-snug text-neutral-600">
              Import a real .lrc to replace the estimate.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );

  async function importLrc(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    const parsed = parseLrc(text);
    if (parsed.length === 0) {
      setStatus('That file has no LRC timestamps.');
      return;
    }
    setDraft((current) => ({ ...current, cues: parsed }));
    setStatus(`Imported ${parsed.length} real cue${parsed.length === 1 ? '' : 's'}.`);
  }
}

function MiniButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-200 hover:bg-neutral-700"
    >
      {children}
    </button>
  );
}

function pickMime(): string | null {
  const options = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  for (const option of options) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(option)) return option;
  }
  return null;
}

function bitrate(size: { width: number; height: number }): number {
  const pixels = size.width * size.height;
  return Math.round(pixels * 2.4);
}

function drawFrame(canvas: HTMLCanvasElement, cues: readonly Cue[], theme: VideoTheme, time: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  const cue = activeCue(cues, time);
  const scale = width / 1280;
  const fontSize = Math.round(46 * scale);
  const lineHeight = Math.round(fontSize * 1.35);

  if (cue) {
    const local = Math.max(0, time - cue.start);
    const fade = Math.min(1, local / 0.35);
    ctx.globalAlpha = fade;
    ctx.fillStyle = theme.foreground;
    ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = wrapLine(cue.text, Math.max(12, Math.floor(width / (fontSize * 0.56))));
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });
    ctx.globalAlpha = 1;

    // Progress hairline in the accent colour.
    const span = Math.max(0.001, cue.end - cue.start);
    ctx.fillStyle = theme.accent;
    ctx.fillRect(0, height - Math.max(4, Math.round(6 * scale)), width * Math.min(1, local / span), Math.max(4, Math.round(6 * scale)));
  }

  ctx.fillStyle = theme.foreground;
  ctx.globalAlpha = 0.35;
  ctx.font = `400 ${Math.round(16 * scale)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(clock(time), Math.round(24 * scale), height - Math.round(24 * scale));
  ctx.globalAlpha = 1;
}
