/** The power tools: lyric diff, tag normaliser, duration estimate, excludes. */

import { useEffect, useMemo, useState } from 'react';

import { diffLyrics, summarizeDiff } from '../lib/diffLyrics';
import { EXCLUDE_CATEGORIES, buildExclude, suggestFor } from '../lib/excludeStyles';
import { PACE_PRESETS, estimateDuration } from '../lib/estimateDuration';
import { normalizeTags, tagStats } from '../lib/normalizeTags';
import { PILLARS, SEED_POOL, generateStyle, nextSeed, type Pillar, type StyleRoll } from '../lib/randomStyle';
import { TEMPLATES, applyTemplate, detectSections, suggestTemplate } from '../lib/structure';
import { allStyles, searchStyles, upsertStyle, userStyleId, type StyleEntry } from '../lib/styleLibrary';
import { useBuilder } from '../state/builder';
import { send } from '../messages';
import { BudgetMeter, Button, Card, Field } from './ui';

type ToolId = 'diff' | 'tags' | 'duration' | 'exclude' | 'random' | 'structure' | 'styles';

export function ToolsPanel() {
  const [tool, setTool] = useState<ToolId>('tags');
  const tools: { id: ToolId; label: string }[] = [
    { id: 'tags', label: 'Tags' },
    { id: 'diff', label: 'Lyric diff' },
    { id: 'duration', label: 'Duration' },
    { id: 'exclude', label: 'Exclude' },
    { id: 'random', label: 'Random' },
    { id: 'structure', label: 'Structure' },
    { id: 'styles', label: 'Styles' },
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
      {tool === 'random' ? <RandomTool /> : null}
      {tool === 'structure' ? <StructureTool /> : null}
      {tool === 'styles' ? <StylesTool /> : null}
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

/**
 * Random styles with lock & re-roll.
 *
 * The lock is the feature: a roll you liked is reproducible from its seed, and
 * pinning a pillar keeps it while the rest moves.
 */
function RandomTool() {
  const [seed, setSeed] = useState(7);
  const [locked, setLocked] = useState<Partial<Record<Pillar, string>>>({});
  const [history, setHistory] = useState<StyleRoll[]>([]);
  const roll = useMemo(() => generateStyle({ seed, locked }), [seed, locked]);
  const setStyleText = useBuilder((store) => store.setStyleText);

  useEffect(() => {
    setHistory((current) => (current[0]?.seed === roll.seed ? current : [roll, ...current].slice(0, 8)));
  }, [roll]);

  function toggleLock(pillar: Pillar) {
    setLocked((current) => {
      if (current[pillar]) {
        const next = { ...current };
        delete next[pillar];
        return next;
      }
      const value = roll.picks[pillar];
      return value ? { ...current, [pillar]: value } : current;
    });
  }

  return (
    <Card
      title="Random style"
      actions={
        <Button variant="primary" onClick={() => setSeed((value) => nextSeed(value))}>
          Re-roll
        </Button>
      }
    >
      <div className="space-y-1">
        {PILLARS.map((pillar) => {
          const value = roll.picks[pillar];
          const pool = SEED_POOL[pillar];
          const isLocked = Boolean(locked[pillar]);
          return (
            <div key={pillar} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleLock(pillar)}
                title={isLocked ? 'Unlock' : 'Lock this pillar'}
                className={`w-5 rounded text-[10px] ${isLocked ? 'bg-emerald-600/30 text-emerald-300' : 'text-neutral-600 hover:text-neutral-400'}`}
              >
                {isLocked ? '🔒' : '🔓'}
              </button>
              <span className="w-20 shrink-0 text-[10px] uppercase tracking-wide text-neutral-500">{pillar}</span>
              <select
                value={value ?? ''}
                onChange={(event) =>
                  setLocked((current) => ({ ...current, [pillar]: event.target.value }))
                }
                className="min-w-0 flex-1 rounded bg-neutral-900 px-1.5 py-0.5 text-[11px] text-neutral-200 outline-none"
              >
                {value ? null : <option value="">—</option>}
                {[...new Set([value, ...pool].filter(Boolean) as string[])].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <p className="rounded bg-neutral-950 p-2 font-mono text-[10px] leading-snug text-neutral-300">{roll.style}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-neutral-600">seed {roll.seed}</span>
        <div className="flex gap-1">
          <Button onClick={() => navigator.clipboard?.writeText(roll.style).catch(() => undefined)}>Copy</Button>
          <Button variant="primary" onClick={() => setStyleText(roll.style)}>
            To builder
          </Button>
        </div>
      </div>
      {history.length > 1 ? (
        <div className="space-y-0.5 border-t border-neutral-800 pt-1">
          <p className="text-[10px] uppercase tracking-wide text-neutral-600">Recent rolls</p>
          {history.slice(1).map((entry) => (
            <button
              key={entry.seed}
              type="button"
              onClick={() => setSeed(entry.seed)}
              className="block w-full truncate text-left text-[10px] text-neutral-500 hover:text-neutral-300"
              title={`seed ${entry.seed}`}
            >
              {entry.style}
            </button>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

/** Structure tags: pick a song shape, get the headings placed. */
function StructureTool() {
  const [lyrics, setLyrics] = useState(
    'streetlight hums a colour i cannot name\nevery window is lit but mine\nsay it slower say it twice\ni will be the echo you be the ice',
  );
  const lineCount = lyrics.split('\n').filter((line) => line.trim()).length;
  const [templateId, setTemplateId] = useState(() => suggestTemplate(lineCount).id);
  const template = TEMPLATES.find((entry) => entry.id === templateId) ?? TEMPLATES[0]!;
  const result = useMemo(() => applyTemplate(lyrics, template), [lyrics, template]);
  const existing = useMemo(() => detectSections(lyrics), [lyrics]);

  return (
    <Card title="Structure tags">
      <textarea
        value={lyrics}
        onChange={(event) => setLyrics(event.target.value)}
        rows={7}
        spellCheck={false}
        className="w-full resize-none rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-[11px] outline-none focus:border-emerald-700"
      />
      <div className="flex flex-wrap items-center gap-1">
        {TEMPLATES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTemplateId(entry.id)}
            className={`rounded px-1.5 py-0.5 text-[10px] ${entry.id === templateId ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            {entry.name}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-neutral-500">{template.note}</p>
      {existing.length > 0 ? (
        <p className="text-[10px] text-amber-400">
          Already tagged ({existing.slice(0, 6).join(', ')}) — left untouched.
        </p>
      ) : null}
      {result.warnings.map((warning) => (
        <p key={warning} className="text-[10px] text-amber-400">
          {warning}
        </p>
      ))}
      <pre className="max-h-48 overflow-auto rounded bg-neutral-950 p-2 font-mono text-[10px] text-neutral-300">
        {result.text}
      </pre>
      <div className="flex gap-1">
        <Button onClick={() => navigator.clipboard?.writeText(result.text).catch(() => undefined)}>Copy</Button>
        <Button variant="primary" onClick={() => setLyrics(result.text)} disabled={existing.length > 0}>
          Apply to input
        </Button>
      </div>
    </Card>
  );
}

/** The local style library: seed entries plus the user's own, searchable. */
function StylesTool() {
  const [query, setQuery] = useState('');
  const [userEntries, setUserEntries] = useState<StyleEntry[]>([]);
  const [name, setName] = useState('');
  const [style, setStyle] = useState('');
  const setStyleText = useBuilder((store) => store.setStyleText);

  useEffect(() => {
    void (async () => {
      const response = await send<{ ok: true; data: { user: StyleEntry[] } }>({ type: 'styles:list' });
      if (response.ok) setUserEntries(response.data.user);
    })();
  }, []);

  const entries = useMemo(() => allStyles(userEntries), [userEntries]);
  const results = useMemo(() => searchStyles(entries, query), [entries, query]);

  async function save() {
    if (!style.trim()) return;
    const entry: StyleEntry = {
      id: userStyleId(name || style.split(',')[0] || 'style'),
      name: name.trim() || style.split(',')[0]?.trim() || 'Untitled',
      style: style.trim(),
      tags: style.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
      source: 'user',
    };
    const response = await send<{ ok: true; data: StyleEntry }>({ type: 'styles:save', entry });
    if (response.ok) {
      setUserEntries((current) => upsertStyle(current, entry));
      setName('');
      setStyle('');
    }
  }

  return (
    <Card title="Style library" actions={<span className="text-[10px] text-neutral-600">{results.length}</span>}>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="search name, tags, style…"
        className="w-full rounded bg-neutral-900 px-2 py-1 text-[11px] text-neutral-200 outline-none"
      />
      <ul className="max-h-56 space-y-1 overflow-auto">
        {results.slice(0, 30).map((entry) => (
          <li key={entry.id} className="rounded bg-neutral-950 p-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[11px] font-medium text-neutral-200">{entry.name}</span>
              <button
                type="button"
                onClick={() => setStyleText(entry.style)}
                className="shrink-0 text-[10px] text-emerald-400 hover:text-emerald-300"
              >
                use
              </button>
            </div>
            <p className="truncate font-mono text-[10px] text-neutral-500">{entry.style}</p>
          </li>
        ))}
        {results.length === 0 ? <li className="text-[10px] text-neutral-600">nothing matched</li> : null}
      </ul>
      <div className="space-y-1 border-t border-neutral-800 pt-1.5">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="name"
          className="w-full rounded bg-neutral-900 px-2 py-1 text-[11px] outline-none"
        />
        <textarea
          value={style}
          onChange={(event) => setStyle(event.target.value)}
          placeholder="style string to save"
          rows={2}
          className="w-full resize-none rounded bg-neutral-900 px-2 py-1 font-mono text-[10px] outline-none"
        />
        <Button variant="primary" onClick={() => void save()} disabled={!style.trim()}>
          Save to library
        </Button>
      </div>
    </Card>
  );
}
