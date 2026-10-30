/**
 * Batch capture: paste links → parse → run → export.
 *
 * The panel never fetches anything itself. It asks the background worker, which
 * schedules the requests and reports progress back as events.
 */

import { useEffect, useMemo, useState } from 'react';

import { captureStats, type SongCapture } from '../lib/capture';
import { exportFilename, toCsv } from '../lib/csv';
import { planBatches } from '../lib/batchPlan';
import { parseLinks, summarizeLinks } from '../lib/parseLinks';
import { toCaptureRows } from '../lib/capture';
import { send, type BatchProgress } from '../messages';
import { BudgetMeter, Button, Card, Empty, Pill } from './ui';

export function BatchPanel() {
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [captures, setCaptures] = useState<SongCapture[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const parsed = useMemo(() => parseLinks(input), [input]);
  const plan = useMemo(() => planBatches(parsed.refs.map((ref) => ref.canonicalUrl)), [parsed]);
  const stats = useMemo(() => captureStats(captures), [captures]);

  useEffect(() => {
    void (async () => {
      const response = await send<{ ok: true; data: SongCapture[] }>({ type: 'captures:list' }).catch(() => null);
      if (response?.ok && Array.isArray(response.data)) setCaptures(response.data);
      const status = await send<{ ok: true; data: BatchProgress | null }>({ type: 'batch:status' }).catch(() => null);
      if (status?.ok && status.data) setProgress(status.data);
    })();
    const listener = (event: unknown) => {
      const payload = event as { type?: string; progress?: BatchProgress };
      if (payload.type === 'batch:progress' && payload.progress) setProgress(payload.progress);
      if (payload.type === 'batch:done' && payload.progress) {
        setProgress({ ...payload.progress, complete: true });
        setBusy(false);
        void refresh();
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    const response = await send<{ ok: true; data: SongCapture[] }>({ type: 'captures:list' }).catch(() => null);
    if (response?.ok && Array.isArray(response.data)) setCaptures(response.data);
  }

  async function start() {
    if (parsed.refs.length === 0) {
      setMessage('Nothing to capture yet — paste at least one Suno link.');
      return;
    }
    setBusy(true);
    setMessage('');
    const response = await send<{ ok: true; data: BatchProgress } | { ok: false; error: string }>({
      type: 'batch:start',
      refs: parsed.refs,
    }).catch((error: Error) => ({ ok: false as const, error: error.message }));
    if (response.ok) {
      setProgress(response.data);
    } else {
      setBusy(false);
      setMessage(response.error);
    }
  }

  async function cancel() {
    await send({ type: 'batch:cancel' }).catch(() => null);
    setBusy(false);
    setMessage('Batch cancelled.');
  }

  function exportCsv() {
    if (captures.length === 0) return;
    const csv = toCsv(toCaptureRows(captures));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = exportFilename('suno-captures');
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <Card title="Paste links">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={5}
          className="w-full resize-none rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-[11px] text-neutral-100 outline-none focus:border-emerald-700"
          placeholder={`https://suno.com/song/…\nhttps://suno.com/playlist/…\n@songwriter`}
        />
        <p className="text-[11px] text-neutral-400">{input.trim() ? summarizeLinks(parsed) : 'Songs, playlists and profiles — duplicates are dropped.'}</p>
        {parsed.invalid.length > 0 ? (
          <details className="text-[10px] text-amber-300">
            <summary className="cursor-pointer">{parsed.invalid.length} line(s) could not be read</summary>
            <ul className="mt-1 space-y-0.5 text-neutral-400">
              {parsed.invalid.slice(0, 6).map((entry) => (
                <li key={`${entry.index}-${entry.raw}`} className="truncate">
                  <span className="text-neutral-500">#{entry.index + 1}</span> {entry.reason}: <span className="font-mono">{entry.raw.slice(0, 40)}</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
        <div className="flex items-center gap-2 pt-1">
          <Button variant="primary" onClick={() => void start()} disabled={busy || parsed.refs.length === 0}>
            {busy ? 'Capturing…' : `Capture ${parsed.refs.length || ''}`}
          </Button>
          {busy ? (
            <Button variant="danger" onClick={() => void cancel()}>
              Cancel
            </Button>
          ) : null}
          {parsed.refs.length > 0 ? (
            <span className="text-[10px] text-neutral-500">
              {plan.batches.length} batched request(s) · ~{(plan.estimatedMs / 1000).toFixed(1)}s
            </span>
          ) : null}
        </div>
        {message ? <p className="text-[11px] text-amber-300">{message}</p> : null}
      </Card>

      {progress ? (
        <Card title="Progress">
          <BudgetMeter chars={progress.done + progress.failed} limit={Math.max(1, progress.total)} label="settled" />
          <div className="flex flex-wrap gap-1 text-[10px]">
            <Pill tone="good">{progress.done} captured</Pill>
            {progress.running > 0 ? <Pill tone="neutral">{progress.running} running</Pill> : null}
            {progress.queued > 0 ? <Pill tone="neutral">{progress.queued} queued</Pill> : null}
            {progress.failed > 0 ? <Pill tone="bad">{progress.failed} failed</Pill> : null}
            {progress.manual > 0 ? <Pill tone="warn">{progress.manual} need a tab</Pill> : null}
          </div>
          {progress.errors.length > 0 ? (
            <ul className="space-y-0.5 text-[10px] text-neutral-500">
              {progress.errors.slice(0, 4).map((error) => (
                <li key={error.url} className="truncate">
                  {error.error} — {error.url.replace('https://suno.com/', '')}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-[10px] text-neutral-500">
            Public pages only — no cookies are sent, and playlists/profiles need the tab capture button.
          </p>
        </Card>
      ) : null}

      <Card
        title={`Captured (${stats.total})`}
        actions={
          <div className="flex gap-1">
            <Button variant="ghost" onClick={() => void refresh()}>
              Refresh
            </Button>
            <Button onClick={exportCsv} disabled={captures.length === 0}>
              CSV
            </Button>
          </div>
        }
      >
        {captures.length === 0 ? (
          <Empty>Nothing captured yet. Song pages expose title, creator, duration and cover art when the page publishes them.</Empty>
        ) : (
          <>
            <div className="flex flex-wrap gap-1 text-[10px]">
              <Pill tone="good">{stats.ok} complete</Pill>
              <Pill tone="warn">{stats.partial} partial</Pill>
              {stats.manual > 0 ? <Pill tone="neutral">{stats.manual} manual</Pill> : null}
              {stats.failed > 0 ? <Pill tone="bad">{stats.failed} failed</Pill> : null}
              {stats.averageSeconds !== null ? <Pill tone="neutral">avg {Math.round(stats.averageSeconds / 60)}m</Pill> : null}
            </div>
            <ul className="max-h-52 divide-y divide-neutral-800 overflow-auto text-[11px]">
              {captures.slice(0, 60).map((capture) => (
                <li key={`${capture.kind}-${capture.id || capture.url}`} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="truncate text-neutral-200">{capture.title || capture.url}</span>
                  <span className="shrink-0 text-[10px] text-neutral-500">
                    {capture.creator || '—'}
                    {capture.durationSeconds !== null ? ` · ${Math.floor(capture.durationSeconds / 60)}:${String(capture.durationSeconds % 60).padStart(2, '0')}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
      <p className="px-1 text-[10px] text-neutral-600">Metadata only. Audio is never downloaded or stored by this extension.</p>
    </div>
  );
}
