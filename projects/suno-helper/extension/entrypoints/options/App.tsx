import { useEffect, useState } from 'react';

import { exportFilename, parseJsonExport, toCsv, toJsonExport } from '../../src/lib/csv';
import { PromptStore, chromeStorage, type PromptRecord } from '../../src/lib/storage';

const store = new PromptStore(chromeStorage());

export default function Options() {
  const [library, setLibrary] = useState<PromptRecord[]>([]);
  const [status, setStatus] = useState('');
  const [payload, setPayload] = useState('');

  useEffect(() => {
    void store.getLibrary().then(setLibrary);
  }, []);

  function download(name: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function exportJson() {
    const bundle = await store.exportAll();
    download('suno-helper-library.json', JSON.stringify(bundle, null, 2), 'application/json');
    setStatus(`Exported ${bundle.library.length} prompt(s) as JSON`);
  }

  async function exportCsv() {
    const records = await store.getLibrary();
    const csv = toCsv(
      records.map((record) => ({
        id: record.id,
        title: record.title,
        style: record.style,
        tags: (record.tags ?? []).join('|'),
        model: record.model,
        createdAt: new Date(record.createdAt).toISOString(),
      })),
    );
    download(exportFilename('suno-helper'), csv, 'text/csv');
    setStatus(`Exported ${records.length} prompt(s) as CSV`);
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
        <p className="text-xs text-neutral-500">
          Everything below happens on this device. No account, no sync, no telemetry.
        </p>
      </header>

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
        <h2 className="text-sm font-semibold">Import</h2>
        <p className="text-xs text-neutral-400">
          Paste a JSON export ({toJsonExport([], false).slice(0, 28)}…). Existing ids are updated, not duplicated.
        </p>
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          rows={6}
          className="w-full rounded border border-neutral-800 bg-neutral-900 p-2 font-mono text-[11px]"
          placeholder='{"schema":"suno-helper/export@1","library":[…]}'
        />
        <button onClick={() => void importLibrary()} className="rounded bg-neutral-800 px-3 py-1.5 text-xs">
          Import pasted JSON
        </button>
      </section>

      <section className="rounded-lg border border-neutral-800 p-4 text-xs text-neutral-400">
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">Privacy</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>No text you type leaves the browser. There is no background upload path.</li>
          <li>Only <code>storage</code> permission plus access to suno.com.</li>
          <li>No analytics, no remote config, no remote code.</li>
          <li>Uninstall or “Delete all” removes everything; nothing survives on a server.</li>
        </ul>
      </section>

      {status && <p className="text-xs text-emerald-400">{status}</p>}
    </div>
  );
}
