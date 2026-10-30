/** Lyrics → timestamps, in the popup. The video export lives on its own page. */

import { useMemo, useRef, useState } from 'react';

import { DRAFT_KEY, parseDurationInput, type StudioDraft } from '../lib/draft';
import { downloadText, safeDownloadName, stampedName } from '../lib/download';
import { PACE_PRESETS, estimateDuration } from '../lib/estimateDuration';
import {
  cuesFromTaps,
  distributeCues,
  formatClock,
  toLines,
  toLrc,
  toSrt,
  toVtt,
} from '../lib/timestamps';
import { BudgetMeter, Button, Card, Field } from './ui';

type Format = 'lrc' | 'srt' | 'vtt';

const SAMPLE = `[Verse 1]
Streetlight hums a colour I can't name
Every window's lit but mine

[Chorus]
Say it slower, say it twice
I'll be the echo, you be the ice`;

export function StudioPanel() {
  const [lyrics, setLyrics] = useState(SAMPLE);
  const [title, setTitle] = useState('Untitled');
  const [durationInput, setDurationInput] = useState('3:12');
  const [format, setFormat] = useState<Format>('lrc');

  const duration = parseDurationInput(durationInput);
  const estimate = useMemo(() => estimateDuration(lyrics, 'v5.5'), [lyrics]);
  const lines = useMemo(() => toLines(lyrics), [lyrics]);
  const cues = useMemo(
    () => (duration ? distributeCues(lyrics, { durationSeconds: duration }) : []),
    [lyrics, duration],
  );
  const output = useMemo(() => {
    const meta = { title, artist: 'Suno Helper' };
    if (format === 'lrc') return toLrc(cues, meta);
    if (format === 'srt') return toSrt(cues);
    return toVtt(cues);
  }, [cues, format, title]);

  const [taps, setTaps] = useState<number[]>([]);
  const startRef = useRef<number | null>(null);
  const tapCues = taps.length > 0 && duration ? cuesFromTaps(taps, lines, duration) : [];

  function tap() {
    const now = performance.now() / 1000;
    if (startRef.current === null) startRef.current = now;
    setTaps((current) => [...current, Number((now - startRef.current!).toFixed(3))]);
  }

  function resetTaps() {
    setTaps([]);
    startRef.current = null;
  }

  async function openStudio() {
    const draft: StudioDraft = {
      title,
      lyrics,
      cues: tapCues.length > 0 ? tapCues : cues,
      themeId: 'midnight',
      updatedAt: Date.now(),
    };
    await chrome.storage.local.set({ [DRAFT_KEY]: draft });
    await chrome.tabs.create({ url: chrome.runtime.getURL('studio.html') });
  }

  return (
    <div className="space-y-3">
      <Card>
        <Field label="Track title" hint="used for filenames">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded bg-neutral-900 px-2 py-1 text-[12px] text-neutral-100 outline-none"
          />
        </Field>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Field label="Duration" hint="m:ss or seconds">
            <input
              value={durationInput}
              onChange={(event) => setDurationInput(event.target.value)}
              className="w-full rounded bg-neutral-900 px-2 py-1 text-[12px] text-neutral-100 outline-none"
            />
          </Field>
          <Field label="Format">
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as Format)}
              className="w-full rounded bg-neutral-900 px-2 py-1 text-[12px] text-neutral-100 outline-none"
            >
              <option value="lrc">LRC (players)</option>
              <option value="srt">SRT (video)</option>
              <option value="vtt">WebVTT (web)</option>
            </select>
          </Field>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500">
          <span>
            {lines.length} lyric line{lines.length === 1 ? '' : 's'}
            {duration === null ? ' · duration unreadable' : ''}
          </span>
          <span>
            estimator says {Math.floor(estimate.seconds / 60)}:
            {String(Math.round(estimate.seconds % 60)).padStart(2, '0')}
          </span>
        </div>
        {duration === null ? (
          <p className="mt-1 text-[10px] text-amber-400">
            pace presets:{' '}
            {PACE_PRESETS.map((preset) => `${preset.label} ${preset.rate}/s`).join(' · ')}
          </p>
        ) : null}
      </Card>

      <Field label="Lyrics" hint="blank lines and [tags] are ignored">
        <textarea
          value={lyrics}
          onChange={(event) => setLyrics(event.target.value)}
          rows={9}
          spellCheck={false}
          className="w-full resize-y rounded bg-neutral-900 px-2 py-1.5 font-mono text-[11px] text-neutral-200 outline-none"
        />
      </Field>

      <div className="flex flex-wrap gap-1.5">
        <Button
          variant="primary"
          disabled={cues.length === 0}
          onClick={() => downloadText(stampedName(safeDownloadName(title), format), output)}
        >
          Export {format.toUpperCase()}
        </Button>
        <Button disabled={cues.length === 0} onClick={() => void navigator.clipboard.writeText(output)}>
          Copy
        </Button>
        <Button disabled={lines.length === 0} onClick={() => void openStudio()}>
          Video studio ↗
        </Button>
      </div>

      {cues.length > 0 ? (
        <Card>
          <div className="mb-1 flex items-center justify-between text-[10px] text-neutral-500">
            <span>Preview</span>
            <span className="text-amber-400/80">estimated — not transcription</span>
          </div>
          <ul className="max-h-40 space-y-0.5 overflow-auto">
            {cues.slice(0, 40).map((cue) => (
              <li key={cue.index} className="flex gap-2 text-[11px]">
                <span className="w-12 shrink-0 font-mono text-neutral-500">{formatClock(cue.start, '.')}</span>
                <span className="truncate text-neutral-200">{cue.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-medium text-neutral-300">Tap timing</span>
          <span className="text-[10px] text-neutral-500">{taps.length} taps</span>
        </div>
        <p className="mb-2 text-[10px] leading-snug text-neutral-500">
          Play the track elsewhere and tap once per line. These are real timestamps — they beat the
          estimate every time.
        </p>
        <div className="flex gap-1.5">
          <Button variant="primary" onClick={tap}>
            Tap
          </Button>
          <Button variant="ghost" onClick={resetTaps} disabled={taps.length === 0}>
            Reset
          </Button>
          <Button
            variant="ghost"
            disabled={tapCues.length === 0}
            onClick={() => downloadText(stampedName(safeDownloadName(title), 'lrc'), toLrc(tapCues, { title }))}
          >
            Export tapped LRC
          </Button>
        </div>
        {tapCues.length > 0 ? (
          <p className="mt-1 text-[10px] text-emerald-400">
            {tapCues.length} real cue{tapCues.length === 1 ? '' : 's'} from taps
          </p>
        ) : null}
      </Card>

      <BudgetMeter chars={output.length} limit={20000} label="subtitle file" />
    </div>
  );
}
