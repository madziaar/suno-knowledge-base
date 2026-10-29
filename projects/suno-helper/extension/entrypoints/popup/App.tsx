import { useEffect, useMemo, useState } from 'react';

import { cleanStyle } from '../../src/lib/cleanStyle';
import { EMPTY_STYLE_STATE, PILLARS, buildStyle, rollStyle, toggleLock, type PillarId, type StyleState } from '../../src/lib/buildStyle';
import { checkBudget, charCount, type ModelId } from '../../src/lib/limits';
import { diffLyrics, summarizeDiff } from '../../src/lib/diffLyrics';
import { estimateDuration, formatDuration } from '../../src/lib/estimateDuration';
import { normalizeTags, tagStats } from '../../src/lib/normalizeTags';
import { PromptStore, chromeStorage, type PromptRecord } from '../../src/lib/storage';

const store = new PromptStore(chromeStorage());

type Tab = 'library' | 'builder' | 'tools';

export default function App() {
  const [tab, setTab] = useState<Tab>('builder');
  const [model, setModel] = useState<ModelId>('v5.5');
  const [library, setLibrary] = useState<PromptRecord[]>([]);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    void (async () => {
      const settings = await store.getSettings();
      setModel(settings.model);
      setLibrary(await store.getLibrary());
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const handle = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(handle);
  }, [toast]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return library;
    return library.filter((record) =>
      [record.title, record.style, record.lyrics, ...(record.tags ?? [])].join(' ').toLowerCase().includes(needle),
    );
  }, [library, query]);

  async function save(record: Omit<PromptRecord, 'createdAt' | 'updatedAt' | 'schemaVersion'>) {
    const saved = await store.savePrompt(record);
    setLibrary(await store.getLibrary());
    setToast(`Saved “${saved.title}”`);
  }

  async function remove(id: string) {
    await store.deletePrompt(id);
    setLibrary(await store.getLibrary());
  }

  async function applyToPage(record: PromptRecord) {
    chrome.runtime.sendMessage({ type: 'page:fill', record }, () => setToast('Sent to the Suno tab'));
  }

  return (
    <div className="flex h-[600px] w-[420px] flex-col bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Suno Helper</h1>
          <p className="text-[11px] text-neutral-500">local-first · nothing leaves this device</p>
        </div>
        <select
          aria-label="Model"
          value={model}
          onChange={(event) => {
            const next = event.target.value as ModelId;
            setModel(next);
            void store.saveSettings({ model: next });
          }}
          className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs"
        >
          {['v5.5', 'v5', 'v4.5+', 'v4.5', 'v4', 'v3.5'].map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </header>

      <nav className="flex gap-1 border-b border-neutral-800 px-3 py-2 text-xs">
        {(['builder', 'tools', 'library'] as Tab[]).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-1.5 capitalize transition ${
              tab === id ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {id}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-3">
        {tab === 'builder' && <Builder model={model} onSave={save} onToast={setToast} />}
        {tab === 'tools' && <Tools model={model} onToast={setToast} />}
        {tab === 'library' && (
          <Library
            records={filtered}
            query={query}
            onQuery={setQuery}
            onDelete={remove}
            onApply={applyToPage}
          />
        )}
      </main>

      {toast && (
        <div className="border-t border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-emerald-400">{toast}</div>
      )}
    </div>
  );
}

function Builder({
  model,
  onSave,
  onToast,
}: {
  model: ModelId;
  onSave: (record: Omit<PromptRecord, 'createdAt' | 'updatedAt' | 'schemaVersion'>) => Promise<void>;
  onToast: (message: string) => void;
}) {
  const [state, setState] = useState<StyleState>(EMPTY_STYLE_STATE);
  const [seed, setSeed] = useState(1);
  const style = buildStyle(state);
  const budget = checkBudget('style', style, model);

  return (
    <div className="space-y-3">
      {PILLARS.map((pillar) => (
        <div key={pillar.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor={pillar.id} className="text-xs font-medium text-neutral-300">
              {pillar.label}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500">{pillar.hint}</span>
              <button
                onClick={() => setState((current) => toggleLock(current, pillar.id as PillarId))}
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  state.locked.includes(pillar.id as PillarId)
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
                title="Lock this pillar across re-rolls"
              >
                {state.locked.includes(pillar.id as PillarId) ? 'locked' : 'lock'}
              </button>
            </div>
          </div>
          <input
            id={pillar.id}
            value={state[pillar.id as PillarId]}
            onChange={(event) => setState({ ...state, [pillar.id]: event.target.value })}
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs"
            placeholder={pillar.pool[0]}
          />
        </div>
      ))}

      <div className="flex gap-2">
        <button
          onClick={() => {
            const next = seed + 1;
            setSeed(next);
            setState((current) => rollStyle(current, { seed: next }));
          }}
          className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
        >
          Re-roll unlocked
        </button>
        <button
          onClick={() => setState(EMPTY_STYLE_STATE)}
          className="rounded-md border border-neutral-800 px-3 py-2 text-xs text-neutral-400"
        >
          Clear
        </button>
      </div>

      <div className="rounded-md border border-neutral-800 bg-neutral-900 p-2">
        <div className="mb-1 flex items-center justify-between text-[10px] text-neutral-500">
          <span>Style · {charCount(style)}/{budget.limit}</span>
          <span className={budget.ok ? 'text-emerald-400' : 'text-rose-400'}>{budget.ok ? 'fits' : `+${budget.over} over`}</span>
        </div>
        <textarea readOnly value={style} rows={4} className="w-full resize-none bg-transparent text-xs text-neutral-200" />
        <div className="mt-1 flex gap-2">
          <button
            onClick={() => void navigator.clipboard.writeText(style).then(() => onToast('Copied style'))}
            className="rounded bg-neutral-800 px-2 py-1 text-[10px]"
          >
            Copy
          </button>
          <button
            onClick={() =>
              void onSave({
                id: `prompt-${Date.now()}`,
                title: state.genre || 'Untitled idea',
                style,
                lyrics: '',
                tags: [state.genre, state.mood].filter(Boolean),
                model,
              })
            }
            className="rounded bg-neutral-800 px-2 py-1 text-[10px]"
          >
            Save to library
          </button>
        </div>
      </div>
    </div>
  );
}

function Tools({ model, onToast }: { model: ModelId; onToast: (message: string) => void }) {
  const [raw, setRaw] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [original, setOriginal] = useState('');
  const cleaned = cleanStyle(raw, { model });
  const normalized = normalizeTags(lyrics, { inferStructure: true });
  const stats = tagStats(normalized.value);
  const estimate = estimateDuration(normalized.value);
  const diff = original ? diffLyrics(original, lyrics) : null;

  return (
    <div className="space-y-4">
      <section className="space-y-1">
        <h2 className="text-xs font-semibold text-neutral-300">Style cleaner</h2>
        <textarea
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          rows={3}
          placeholder="Paste a messy style string…"
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-xs"
        />
        <div className="rounded-md bg-neutral-900 p-2 text-xs text-neutral-200">{cleaned.value || '—'}</div>
        <p className="text-[10px] text-neutral-500">
          {cleaned.hypeRemoved.length} hype · {cleaned.duplicatesRemoved.length} duplicate · {cleaned.charCount}/{cleaned.limit}
        </p>
        {cleaned.warnings.map((warning) => (
          <p key={warning} className="text-[10px] text-amber-400">
            {warning}
          </p>
        ))}
        <button
          onClick={() => void navigator.clipboard.writeText(cleaned.value).then(() => onToast('Copied cleaned style'))}
          className="rounded bg-neutral-800 px-2 py-1 text-[10px]"
        >
          Copy cleaned
        </button>
      </section>

      <section className="space-y-1">
        <h2 className="text-xs font-semibold text-neutral-300">Lyrics normaliser</h2>
        <textarea
          value={lyrics}
          onChange={(event) => setLyrics(event.target.value)}
          rows={5}
          placeholder="Paste lyrics with any section tags…"
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-xs"
        />
        <div className="rounded-md bg-neutral-900 p-2 text-[11px] text-neutral-300">
          <p>
            {normalized.changed} tag(s) rewritten · sections: {Object.keys(stats.counts).join(', ') || '—'}
          </p>
          <p className="text-neutral-500">
            ≈ {formatDuration(estimate.totalSeconds)} ({formatDuration(estimate.lowSeconds)}–{formatDuration(estimate.highSeconds)}),{' '}
            {estimate.totalSyllables} syllables
          </p>
          {normalized.issues.slice(0, 3).map((issue) => (
            <p key={`${issue.line}-${issue.raw}`} className="text-amber-400">
              line {issue.line}: {issue.reason} — {issue.raw}
            </p>
          ))}
        </div>
        <button
          onClick={() => void navigator.clipboard.writeText(normalized.value).then(() => onToast('Copied lyrics'))}
          className="rounded bg-neutral-800 px-2 py-1 text-[10px]"
        >
          Copy normalised
        </button>
      </section>

      <section className="space-y-1">
        <h2 className="text-xs font-semibold text-neutral-300">Lyric diff</h2>
        <textarea
          value={original}
          onChange={(event) => setOriginal(event.target.value)}
          rows={3}
          placeholder="Previous version (optional)…"
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-xs"
        />
        {diff && <p className="text-[11px] text-neutral-400">{summarizeDiff(diff)}</p>}
      </section>
    </div>
  );
}

function Library({
  records,
  query,
  onQuery,
  onDelete,
  onApply,
}: {
  records: PromptRecord[];
  query: string;
  onQuery: (value: string) => void;
  onDelete: (id: string) => Promise<void>;
  onApply: (record: PromptRecord) => Promise<void>;
}) {
  return (
    <div className="space-y-2">
      <input
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="Search title, style, lyrics, tags…"
        className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs"
      />
      {records.length === 0 && <p className="py-8 text-center text-xs text-neutral-600">Nothing saved yet.</p>}
      {records.map((record) => (
        <article key={record.id} className="rounded-md border border-neutral-800 bg-neutral-900 p-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xs font-semibold">{record.title}</h3>
            <span className="text-[10px] text-neutral-500">{record.model}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] text-neutral-400">{record.style || '(no style)'}</p>
          <div className="mt-2 flex gap-2 text-[10px]">
            <button onClick={() => void onApply(record)} className="rounded bg-emerald-600/20 px-2 py-1 text-emerald-300">
              Fill Suno tab
            </button>
            <button
              onClick={() => void navigator.clipboard.writeText(record.style)}
              className="rounded bg-neutral-800 px-2 py-1 text-neutral-300"
            >
              Copy style
            </button>
            <button onClick={() => void onDelete(record.id)} className="rounded bg-rose-600/15 px-2 py-1 text-rose-300">
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
