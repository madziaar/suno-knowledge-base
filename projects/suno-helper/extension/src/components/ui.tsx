/** Small presentational primitives. No state, no side effects. */

import type { ReactNode } from 'react';

export function Button({
  children,
  onClick,
  variant = 'default',
  disabled,
  title,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  const styles: Record<string, string> = {
    default: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700',
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500',
    ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800',
    danger: 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30',
  };
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-neutral-300">{label}</span>
        {hint ? <span className="text-[10px] text-neutral-500">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

/** Character budget meter. Colour is the signal; the number is the evidence. */
export function BudgetMeter({ chars, limit, label }: { chars: number; limit: number; label: string }) {
  const ratio = limit === 0 ? 1 : Math.min(1, chars / limit);
  const over = chars > limit;
  const near = !over && ratio >= 0.9;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>{label}</span>
        <span className={over ? 'text-rose-400' : near ? 'text-amber-400' : 'text-neutral-400'}>
          {chars} / {limit}
          {over ? ` (+${chars - limit})` : ''}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-neutral-800">
        <div
          className={`h-full transition-all ${over ? 'bg-rose-500' : near ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function Card({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      {title ? (
        <header className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{title}</h2>
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-neutral-800 text-neutral-300',
    good: 'bg-emerald-600/20 text-emerald-300',
    warn: 'bg-amber-500/20 text-amber-300',
    bad: 'bg-rose-600/20 text-rose-300',
  };
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded border border-dashed border-neutral-800 p-3 text-[11px] text-neutral-500">{children}</p>;
}
