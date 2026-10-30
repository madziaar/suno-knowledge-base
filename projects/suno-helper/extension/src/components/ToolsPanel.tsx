/** The power tools: lyric diff, tag normaliser, duration estimate, excludes. */

import { useMemo, useState } from 'react';

import { diffLyrics, summarizeDiff } from '../lib/diffLyrics';
import { EXCLUDE_CATEGORIES, buildExclude, suggestFor } from '../lib/excludeStyles';
import { PACE_PRESETS, estimateDuration } from '../lib/estimateDuration';
import { normalizeTags, tagStats } from '../lib/normalizeTags';
import { useBuilder } from '../state/builder';
import { BudgetMeter, Button, Card, Field } from './ui';

type ToolId = 'diff' | 'tags' | 'duration' | 'exclude';

export function ToolsPanel() {
  const [tool, setTool] = useState<ToolId>('tags');
  const tools: { id: ToolId; label: string }[] = [
    { id: 'tags', label: 'Tags' },
    { id: 'diff', label: 'Lyric diff' },
    { id: 'duration', label: 'Duration' },
    { id: 'exclude', label: 'Exclude' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {tools.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTool(entry.id)}
            className={`rounded px-2 py-1 text-[11px] ${tool === entry.id ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      {tool === 'tags' ? <TagTool /> : null}
      {tool === 'diff' ? <DiffTool /> : null}
      {tool === 'duration' ? <DurationTool /> : null}
      {tool === 'exclude' ? <ExcludeTool /> : null}
    </div>
  );
}

function TagTool() {
  const [input, setInput] = useState('[verse 1]\nfirst line\n(couplet)\nsecond line\n【副歌】\nchorus line');
  const result = useMemo(() => normalizeTags(input), [input]);
  const stats = useMemo(() => tagStats(result.value), [result.value]);

  return (
    <Card title="Structure tags">
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={7}
        className="w-full resize-none rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-[11px] outline-none focus:border-emerald-700"
      />
      <div className="flex gap-1">
        <Button
          onClick={() => {
            navigator.clipboard?.writeText(result.value).catch(() => undefined);
          }}
        >
          Copy normalised
        </Button>
      </div>
      <pre className="max-h-40 overflow-auto rounded bg-neutral-950 p-2 font-mono text-[10px] text-neutral-300">{result.value}</pre>
      <p className="text-[10px] text-neutral-500">
        {result.changed} change(s) · {stats.total} tag(s) · {stats.hasChorus ? 'has a chorus' : 'no chorus tag'}
        {stats.unknown > 0 ? ` · ${stats.unknown} unknown kept verbatim` : ''}
      </p>
    </Card>
  );
}

function DiffTool() {
  const [left, setLeft] = useState('[Verse]\nhold the line\n[Chorus]\nwe are the light');
  const [right, setRight] = useState('[Verse]\nhold the light\n[Chorus]\nwe are the light');
  const result = useMemo(() => diffLyrics(left, right), [left, right]);

  return (
    <Card title="Lyric diff">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Before">
          <textarea
            value={left}
            onChange={(event) => setLeft(event.target.value)}
            rows={7}
            className="w-full resize-none rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-[10px] outline-none focus:border-emerald-700"
          />
        </Field>
        <Field label="After">
          <textarea
            value={right}
            onChange={(event) => setRight(event.target.value)}
            rows={7}
            className="w-full resize-none rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-[10px] outline-none focus:border-emerald-700"
          />
        </Field>
      </div>
      <p className="text-[11px] text-neutral-300">{summarizeDiff(result)}</p>
      <ul className="max-h-40 space-y-0.5 overflow-auto font-mono text-[10px]">
        {result.lines.slice(0, 40).map((line, index) => (
          <li
            key={`${index}-${line.kind}`}
            className={
              line.kind === 'add'
                ? 'text-emerald-400'
                : line.kind === 'remove'
                  ? 'text-rose-400'
                  : line.kind === 'change'
                    ? 'text-amber-300'
                    : 'text-neutral-600'
            }
          >
            {line.kind === 'add' ? '+ ' : line.kind === 'remove' ? '- ' : line.kind === 'change' ? '~ ' : '  '}
            {line.right ?? line.left}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function DurationTool() {
  const [lyrics, setLyrics] = useState('[Verse]\nhello world it is a long long night\n[Chorus]\nhello world again');
  const [pace, setPace] = useState('midtempo');
  const estimate = useMemo(() => estimateDuration(lyrics, pace), [lyrics, pace]);

  return (
    <Card title="Duration estimate">
      <textarea
        value={lyrics}
        onChange={(event) => setLyrics(event.target.value)}
        rows={6}
        className="w-full resize-none rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-[11px] outline-none focus:border-emerald-700"
      />
      <div className="flex items-center gap-2">
        <select
          value={pace}
          onChange={(event) => setPace(event.target.value)}
          className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-1 text-[11px]"
        >
          {PACE_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-neutral-300">≈ {estimate.formatted}</span>
        <span className="text-[10px] text-neutral-500">{estimate.syllables} syllables</span>
      </div>
      <ul className="space-y-0.5 text-[10px] text-neutral-400">
        {estimate.sections.map((section, index) => (
          <li key={`${section.name}-${index}`} className="flex justify-between">
            <span>
              {section.name} <span className="text-neutral-600">({section.lines} lines)</span>
            </span>
            <span>{section.seconds}s</span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-neutral-600">A planning aid, not a measurement.</p>
    </Card>
  );
}

function ExcludeTool() {
  const [selected, setSelected] = useState<string[]>([]);
  const setStyleText = useBuilder((store) => store.setStyleText);
  const result = useMemo(() => buildExclude(selected), [selected]);

  function toggle(item: string) {
    setSelected((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  }

  return (
    <Card
      title="Exclude styles"
      actions={<Button onClick={() => void suggestFor('pop')}>Suggest for pop</Button>}
    >
      <div className="max-h-56 space-y-2 overflow-auto">
        {EXCLUDE_CATEGORIES.map((category) => (
          <div key={category.id}>
            <p className="text-[10px] uppercase tracking-wide text-neutral-500">{category.label}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {category.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(item)}
                  className={`rounded px-1.5 py-0.5 text-[10px] ${selected.includes(item) ? 'bg-rose-600/30 text-rose-200' : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <BudgetMeter chars={result.chars} limit={1000} label="exclude budget" />
      <p className="font-mono text-[10px] text-neutral-400">{result.value || '(nothing selected)'}</p>
      {result.dropped.length > 0 ? <p className="text-[10px] text-amber-300">{result.dropped.length} item(s) did not fit</p> : null}
      <Button
        onClick={() => {
          navigator.clipboard?.writeText(result.value).catch(() => undefined);
          setStyleText(result.value);
        }}
        disabled={selected.length === 0}
      >
        Copy
      </Button>
    </Card>
  );
}
