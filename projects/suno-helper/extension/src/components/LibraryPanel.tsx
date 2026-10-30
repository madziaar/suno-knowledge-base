/** Saved prompts: search, load, fill the page, delete. */

import { useEffect, useMemo, useState } from 'react';

import { PromptStore, chromeStorage, type PromptRecord } from '../lib/storage';
import { send } from '../messages';
import { useBuilder } from '../state/builder';
import { Button, Card, Empty, Pill } from './ui';

const store = new PromptStore(chromeStorage());

export function LibraryPanel({ records, onChanged }: { records: PromptRecord[]; onChanged: () => Promise<void> | void }) {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const loadStyle = useBuilder((store_) => store_.loadStyle);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) => [record.title, record.style, record.lyrics, ...(record.tags ?? [])].join(' ').toLowerCase().includes(needle));
  }, [records, query]);

  useEffect(() => {
    if (!message) return;
    const handle = window.setTimeout(() => setMessage(''), 2200);
    return () => window.clearTimeout(handle);
  }, [message]);

  async function remove(record: PromptRecord) {
    if (!window.confirm(`Delete “${record.title}”?`)) return;
    await store.deletePrompt(record.id);
    await onChanged();
  }

  async function fill(record: PromptRecord) {
    const response = await send({ type: 'page:fill', record }).catch(() => null);
    setMessage(response?.ok ? 'Sent to the Suno tab' : 'Open suno.com/create first');
  }

  async function captureFromTab() {
    const response = await send<{ ok: true; data: { style: string; lyrics: string; title: string } }>({ type: 'page:capture' }).catch(() => null);
    if (!response?.ok || !response.data) {
      setMessage('Open suno.com/create first');
      return;
    }
    const now = Date.now();
    await store.savePrompt({
      id: `capture-${now}`,
      title: response.data.title || response.data.style.slice(0, 40) || 'Captured from Suno',
      style: response.data.style,
      lyrics: response.data.lyrics,
      exclude: '',
      tags: [],
      model: 'v5.5',
      notes: 'captured from the create page',
    });
    await onChanged();
    setMessage('Captured the create form');
  }

  return (
    <div className="space-y-3">
      <Card
        title="Library"
        actions={
          <div className="flex gap-1">
            <Button onClick={() => void captureFromTab()}>Capture tab</Button>
          </div>
        }
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, styles and lyrics…"
          className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-[11px] outline-none focus:border-emerald-700"
        />
        {message ? <p className="text-[10px] text-emerald-400">{message}</p> : null}
        {filtered.length === 0 ? (
          <Empty>{records.length === 0 ? 'Nothing saved yet. Build a style and hit Save.' : 'No match.'}</Empty>
        ) : (
          <ul className="max-h-[380px] divide-y divide-neutral-800 overflow-auto">
            {filtered.map((record) => (
              <li key={record.id} className="space-y-1 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-neutral-100">{record.title}</p>
                    <p className="truncate font-mono text-[10px] text-neutral-500">{record.style || '(no style)'}</p>
                  </div>
                  <Pill tone="neutral">{record.model}</Pill>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => loadStyle(record.style)} title="Load the style into the builder">
                    Load
                  </Button>
                  <Button variant="ghost" onClick={() => void fill(record)} title="Fill the Suno create form">
                    Fill page
                  </Button>
                  <Button variant="danger" onClick={() => void remove(record)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p className="px-1 text-[10px] text-neutral-600">
        {records.length} prompt(s) in chrome.storage.local — export from the options page.
      </p>
    </div>
  );
}
