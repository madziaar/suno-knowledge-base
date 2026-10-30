import { useEffect, useState } from 'react';

import { MODEL_LIMITS, type ModelId } from '../../src/lib/limits';
import { PromptStore, chromeStorage, type PromptRecord } from '../../src/lib/storage';
import { send } from '../../src/messages';
import { BatchPanel } from '../../src/components/BatchPanel';
import { BuilderPanel } from '../../src/components/BuilderPanel';
import { LibraryPanel } from '../../src/components/LibraryPanel';
import { ToolsPanel } from '../../src/components/ToolsPanel';
import { StudioPanel } from '../../src/components/StudioPanel';

const store = new PromptStore(chromeStorage());

type Tab = 'builder' | 'batch' | 'library' | 'tools' | 'studio';

const TABS: { id: Tab; label: string }[] = [
  { id: 'builder', label: 'Builder' },
  { id: 'batch', label: 'Batch' },
  { id: 'library', label: 'Library' },
  { id: 'tools', label: 'Tools' },
  { id: 'studio', label: 'Studio' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('builder');
  const [model, setModel] = useState<ModelId>('v5.5');
  const [library, setLibrary] = useState<PromptRecord[]>([]);
  const [toast, setToast] = useState('');

  async function refresh() {
    setLibrary(await store.getLibrary());
  }

  useEffect(() => {
    void (async () => {
      const settings = await store.getSettings();
      setModel(settings.model);
      await refresh();
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const handle = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(handle);
  }, [toast]);

  async function saveStyle(style: string) {
    const title = style.split(',')[0]?.trim().slice(0, 48) || 'Untitled';
    await store.savePrompt({
      id: `prompt-${Date.now()}`,
      title,
      style,
      lyrics: '',
      exclude: '',
      tags: style.split(',').map((tag) => tag.trim()).filter(Boolean),
      model,
      notes: '',
    });
    await refresh();
    setToast(`Saved “${title}”`);
    setTab('library');
  }

  async function changeModel(next: ModelId) {
    setModel(next);
    await store.saveSettings({ model: next });
    await send({ type: 'settings:save', patch: { model: next } }).catch(() => null);
  }

  return (
    <div className="flex h-[600px] w-[420px] flex-col bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Suno Helper</h1>
          <p className="text-[10px] text-neutral-500">local-first · nothing leaves this device</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Model"
            value={model}
            onChange={(event) => void changeModel(event.target.value as ModelId)}
            className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-1 text-[11px]"
          >
            {Object.keys(MODEL_LIMITS).map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => chrome.runtime.openOptionsPage()}
            className="text-[11px] text-neutral-500 hover:text-neutral-300"
            title="Settings and export"
          >
            ⚙
          </button>
        </div>
      </header>

      <nav className="flex border-b border-neutral-800">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            className={`flex-1 px-2 py-2 text-[11px] font-medium transition ${
              tab === entry.id ? 'border-b-2 border-emerald-500 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-3">
        {tab === 'builder' ? <BuilderPanel onSave={saveStyle} /> : null}
        {tab === 'batch' ? <BatchPanel /> : null}
        {tab === 'library' ? <LibraryPanel records={library} onChanged={refresh} /> : null}
        {tab === 'tools' ? <ToolsPanel /> : null}
        {tab === 'studio' ? <StudioPanel /> : null}
      </main>

      {toast ? (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
