/** Five-pillar builder + style cleaner, in one screen. */

import { useMemo, useState } from 'react';

import { PILLARS, auditStyle } from '../lib/buildStyle';
import { cleanStyle, explainClean } from '../lib/cleanStyle';
import { MODEL_LIMITS, checkBudget, charCount, tagCountStatus } from '../lib/limits';
import { splitTags } from '../lib/text';
import { useBuilder } from '../state/builder';
import { BudgetMeter, Button, Card, Field, Pill } from './ui';

export function BuilderPanel({ onSave }: { onSave: (style: string) => Promise<void> | void }) {
  const model = useBuilder((store) => store.model);
  const style = useBuilder((store) => store.style);
  const styleText = useBuilder((store) => store.styleText);
  const excluded = useBuilder((store) => store.excluded);
  const roll = useBuilder((store) => store.roll);
  const toggle = useBuilder((store) => store.toggle);
  const toggleExclude = useBuilder((store) => store.toggleExclude);
  const setStyleText = useBuilder((store) => store.setStyleText);
  const rendered = useBuilder((store) => store.rendered);
  const [showRaw, setShowRaw] = useState(false);

  const built = rendered();
  const composed = styleText.trim() ? styleText.trim() : built;
  const budget = checkBudget('style', composed, model);
  const tags = splitTags(composed);
  const cleaned = useMemo(() => cleanStyle(composed, { maxChars: MODEL_LIMITS[model].styleChars }), [composed, model]);
  const audits = auditStyle(style);
  const tagTone = tagCountStatus(tags.length);

  return (
    <div className="space-y-3">
      <Card
        title="Five pillars"
        actions={
          <div className="flex gap-1">
            <Button variant="ghost" onClick={() => setShowRaw((value) => !value)} title="Toggle raw style editor">
              {showRaw ? 'pillars' : 'raw'}
            </Button>
            <Button variant="primary" onClick={() => roll()} title="Re-roll every unlocked pillar">
              Re-roll
            </Button>
          </div>
        }
      >
        <div className="space-y-1.5">
          {PILLARS.map((pillar) => {
            const locked = style.locked[pillar.id];
            const values = style.values[pillar.id];
            const audit = audits.find((entry) => entry.pillar === pillar.id);
            const skipped = excluded.includes(pillar.id);
            return (
              <div key={pillar.id} className={`rounded border border-neutral-800 p-2 ${skipped ? 'opacity-40' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggle(pillar.id)}
                      title={locked ? 'Unlock' : 'Lock this pillar across re-rolls'}
                      className={`rounded px-1 text-[11px] ${locked ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      {locked ? '🔒' : '🔓'}
                    </button>
                    <span className="text-[11px] font-medium text-neutral-200">{pillar.label}</span>
                    {audit && audit.status !== 'ok' ? (
                      <Pill tone={audit.status === 'empty' ? 'bad' : audit.status === 'thin' ? 'warn' : 'neutral'}>{audit.status}</Pill>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExclude(pillar.id)}
                    className="text-[10px] text-neutral-500 hover:text-neutral-300"
                    title="Keep this pillar out of the output without losing it"
                  >
                    {skipped ? 'include' : 'skip'}
                  </button>
                </div>
                <p className="mt-1 truncate text-[11px] text-neutral-400">
                  {values.length ? values.join(' · ') : <span className="text-neutral-600">{pillar.hint}</span>}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="Style string"
        actions={
          <Button variant="primary" onClick={() => void onSave(composed)} disabled={composed.length === 0}>
            Save
          </Button>
        }
      >
        {showRaw ? (
          <textarea
            value={styleText || built}
            onChange={(event) => setStyleText(event.target.value)}
            rows={4}
            className="w-full resize-none rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-[11px] text-neutral-100 outline-none focus:border-emerald-700"
            placeholder="Paste or type a style string…"
          />
        ) : (
          <p className="min-h-[52px] rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-[11px] leading-relaxed text-neutral-100">
            {composed || <span className="text-neutral-600">Roll the pillars, or switch to raw and paste.</span>}
          </p>
        )}
        <BudgetMeter chars={budget.chars} limit={budget.limit} label={`${model} style budget`} />
        <div className="flex flex-wrap items-center gap-1 text-[10px] text-neutral-500">
          <Pill tone={tagTone === 'good' ? 'good' : tagTone === 'overloaded' ? 'bad' : 'warn'}>{tags.length} tags</Pill>
          <span>{tagTone === 'good' ? '6–12 reads best' : tagTone === 'thin' ? 'add a few concrete tags' : 'trim — this dilutes priority'}</span>
        </div>
      </Card>

      <Card
        title="Cleaner"
        actions={
          <Button
            onClick={() => {
              const result = cleanStyle(showRaw ? styleText || built : built, { maxChars: MODEL_LIMITS[model].styleChars });
              setStyleText(result.value);
              setShowRaw(true);
            }}
          >
            Clean &amp; edit
          </Button>
        }
      >
        {cleaned.value === composed ? (
          <p className="text-[11px] text-neutral-500">Already clean — nothing to remove.</p>
        ) : (
          <div className="space-y-1 text-[11px] text-neutral-400">
            <p className="text-neutral-300">{explainClean(cleaned)}</p>
            <p className="font-mono text-[10px] text-neutral-500">{cleaned.value || '(empty)'}</p>
          </div>
        )}
        {cleaned.overBudget ? <p className="text-[11px] text-rose-400">Over budget by {charCount(composed) - MODEL_LIMITS[model].styleChars} characters — nothing was cut for you.</p> : null}
      </Card>

      <div className="flex items-center justify-between px-1">
        <Field label="Model" hint="limits follow the model, not the plan">
          <select
            value={model}
            onChange={(event) => useBuilder.getState().setModel(event.target.value as typeof model)}
            className="w-24 rounded border border-neutral-800 bg-neutral-900 px-1.5 py-1 text-[11px]"
          >
            {Object.keys(MODEL_LIMITS).map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </Field>
        <Button variant="ghost" onClick={() => useBuilder.getState().reset()}>
          Reset
        </Button>
      </div>
    </div>
  );
}
