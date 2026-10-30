import { useEffect, useState } from 'react';

import { analyzeSongs, formatDuration } from '../../src/lib/analytics';
import { captureStats, toCaptureRows, type SongCapture } from '../../src/lib/capture';
import { exportFilename, parseJsonExport, toCsv, toJsonExport } from '../../src/lib/csv';
import { PACE_PRESETS } from '../../src/lib/estimateDuration';
import { MODEL_LIMITS, type ModelId } from '../../src/lib/limits';
import { PromptStore, chromeStorage, type PromptRecord, type Settings } from '../../src/lib/storage';
import { send } from '../../src/messages';

const store = new PromptStore(chromeStorage());

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Options() {
  const [library, setLibrary] = useState<PromptRecord[]>([]);
  const [captures, setCaptures] = useState<SongCapture[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState('');
  const [payload, setPayload] = useState('');

  useEffect(() => {
    void (async () => {
      setLibrary(await store.getLibrary());
      setSettings(await store.getSettings());
      const response = await send<{ ok: true; data: SongCapture[] }>({ type: 'captures:list' }).catch(() => null);
      if (response?.ok && Array.isArray(response.data)) setCaptures(response.data);
    })();
  }, []);

  const stats = captureStats(captures);
  const analytics = analyzeSongs(
    captures.map((capture) => ({
      title: capture.title,
      creator: capture.creator,
      durationSeconds: capture.durationSeconds,
      tags: capture.tags,
      url: capture.url,
    })),
  );

  async function patch(next: Partial<Settings>) {
    const saved = await store.saveSettings(next);
    setSettings(saved);
    setStatus('Settings saved');
  }

  async function exportJson() {
    const bundle = await store.exportAll();
    download('suno-helper-library.json', JSON.stringify(bundle, null, 2), 'application/json');
    setStatus(`Exported ${bundle.library.length} prompt(s) as JSON`);
  }

  async function exportCsv() {
    const csv = toCsv(
      library.map((record) => ({
        id: record.id,
        title: record.title,
        style: record.style,
        tags: (record.tags ?? []).join('|'),
        model: record.model,
        createdAt: new Date(record.createdAt).toISOString(),
      })),
    );
    download(exportFilename('suno-helper-prompts'), csv, 'text/csv');
    setStatus(`Exported ${library.length} prompt(s) as CSV`);
  }

  async function exportCaptures() {
    if (captures.length === 0) {
      setStatus('No captures to export yet');
      return;
    }
    download(exportFilename('suno-captures'), toCsv(toCaptureRows(captures)), 'text/csv');
    setStatus(`Exported ${captures.length} capture(s) as CSV`);
  }

  async function clearCaptures() {
    if (!window.confirm('Delete every captured song record on this device?')) return;
    await send({ type: 'captures:clear' }).catch(() => null);
    setCaptures([]);
    setStatus('Capture history cleared');
  }

  async function importLibrary() {
    const records = parseJsonExport(payload);
    if (records.length === 0 && !payload.trim().startsWith('{')) {
      setStatus('Nothing to import — paste a JSON export first');
      return;
    }
    const result = await store.importAll(payload.trim().startsWith('{') ? JSON.parse(payload) : records);
    setLibrary(await store.getLibrary());
    setStatus(`Imported ${result.imported}, skipped ${result.skipped}`);
  }

  async function clearLibrary() {
    if (!window.confirm('Delete every saved prompt on this device? This cannot be undone.')) return;
    await store.clearLibrary();
    setLibrary([]);
    setStatus('Library cleared');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 bg-neutral-950 p-8 text-neutral-100">
      <header>
        <h1 className="text-lg font-semibold">Suno Helper — settings</h1>
        <p className="text-xs text-neutral-500">Everything below happens on this device. No account, no sync, no telemetry.</p>
      </header>

      <section className="space-y-3 rounded-lg border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold">Defaults</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <label className="space-y-1">
            <span className="text-neutral-400">Model</span>
            <select
              value={settings?.model ?? 'v5.5'}
              onChange={(event) => void patch({ model: event.target.value as ModelId })}
              className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1"
            >
              {Object.keys(MODEL_LIMITS).map((id) => (
                <option key={id} value={id}>
                  {id} — style {MODEL_LIMITS[id as ModelId].styleChars} / lyrics {MODEL_LIMITS[id as ModelId].lyricsChars}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-neutral-400">Pace preset</span>
            <select
              value={settings?.pace ?? 'midtempo'}
              onChange={(event) => void patch({ pace: event.target.value })}
              className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1"
            >
              {PACE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-xs text-neutral-300">
          <input
            type="checkbox"
            checked={settings?.autoClean ?? true}
            onChange={(event) => void patch({ autoClean: event.target.checked })}
          />
          Clean pasted style strings automatically
        </label>
        <label className="flex items-center gap-2 text-xs text-neutral-300">
          <input
            type="checkbox"
            checked={settings?.confirmDelete ?? true}
            onChange={(event) => void patch({ confirmDelete: event.target.checked })}
          />
          Ask before deleting a saved prompt
        </label>
      </section>

      <section className="space-y-2 rounded-lg border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold">Library</h2>
        <p className="text-xs text-neutral-400">{library.length} saved prompt(s), stored in chrome.storage.local.</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button onClick={() => void exportJson()} className="rounded bg-emerald-600 px-3 py-1.5 font-medium text-white">
            Export JSON
          </button>
          <button onClick={() => void exportCsv()} className="rounded bg-neutral-800 px-3 py-1.5">
            Export CSV
          </button>
          <button onClick={() => void clearLibrary()} className="rounded bg-rose-600/20 px-3 py-1.5 text-rose-300">
            Delete all
          </button>
        </div>
      </section>

      <section className="space-y-2 rounded-lg border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold">Captured songs</h2>
        <p className="text-xs text-neutral-400">
          {stats.total} record(s): {stats.ok} complete, {stats.partial} partial, {stats.manual} manual, {stats.failed} failed
          {stats.averageSeconds !== null ? ` · average ${(stats.averageSeconds / 60).toFixed(1)} min` : ''}.
        </p>
        <p className="text-[11px] text-neutral-500">
          Captures come from the public pages you asked about: title, creator, duration, tags and cover art when the page publishes them.
          No audio is stored and no cookie is sent.
        </p>
        {analytics.count > 0 ? (
          <div className="space-y-1 rounded border border-neutral-800 p-2">
            <p className="text-[11px] text-neutral-300">
              median {formatDuration(analytics.medianSeconds)} · shortest {formatDuration(analytics.minSeconds)} ·
              longest {formatDuration(analytics.maxSeconds)}
              {analytics.missingDuration > 0 ? ` · ${analytics.missingDuration} without a duration` : ''}
              {analytics.thin ? ' · small sample, treat with care' : ''}
            </p>
            <div className="flex gap-0.5" aria-label="duration distribution">
              {analytics.buckets.map((bucket) => {
                const peak = Math.max(1, ...analytics.buckets.map((entry) => entry.count));
                return (
                  <div key={bucket.label} className="flex-1 text-center" title={`${bucket.label}: ${bucket.count}`}>
                    <div
                      className="mx-auto rounded-t bg-emerald-600/60"
                      style={{ height: `${Math.round((bucket.count / peak) * 28) + 2}px`, width: '70%' }}
                    />
                    <span className="block text-[9px] text-neutral-600">{bucket.label.replace('–00', '')}</span>
                  </div>
                );
              })}
            </div>
            {analytics.tags.length > 0 ? (
              <p className="truncate text-[10px] text-neutral-500">
                top styles: {analytics.tags.slice(0, 6).map((tag) => `${tag.name} (${tag.count})`).join(', ')}
              </p>
            ) : null}
            {analytics.duplicates.length > 0 ? (
              <p className="truncate text-[10px] text-amber-400/80">
                duplicate titles: {analytics.duplicates.slice(0, 4).map((entry) => entry.name).join(', ')}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs">
          <button onClick={() => void exportCaptures()} className="rounded bg-neutral-800 px-3 py-1.5">
            Export captures CSV
          </button>
          <button onClick={() => void clearCaptures()} className="rounded bg-rose-600/20 px-3 py-1.5 text-rose-300">
            Clear captures
          </button>
        </div>
      </section>

      <section className="space-y-2 rounded-lg border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold">Import</h2>
        <p className="text-xs text-neutral-400">
          Paste a JSON export ({toJsonExport([], false).slice(0, 28)}…). Existing ids are updated, not duplicated.
        </p>
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          rows={6}
          className="w-full rounded border border-neutral-800 bg-neutral-900 p-2 font-mono text-[11px]"
          placeholder='{"schema":"suno-helper/library@1","library":[…]}'
        />
        <button onClick={() => void importLibrary()} className="rounded bg-neutral-800 px-3 py-1.5 text-xs">
          Import pasted JSON
        </button>
      </section>

      <section className="rounded-lg border border-neutral-800 p-4 text-xs text-neutral-400">
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">Privacy</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>No text you type leaves the browser. The only network calls are the batch captures you start, to public suno.com pages.</li>
          <li>Those fetches are made with <code>credentials: 'omit'</code>: no cookie, no session, no account.</li>
          <li>Only <code>storage</code> permission plus host access to suno.com.</li>
          <li>No analytics, no remote config, no remote code.</li>
          <li>Uninstall or “Delete all” removes everything; nothing survives on a server.</li>
        </ul>
      </section>

      {status && <p className="text-xs text-emerald-400">{status}</p>}
    </div>
  );
}
