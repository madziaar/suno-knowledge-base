/**
 * Lyric Diff Tool.
 *
 * Compare two drafts at line level. The point is not a pretty diff — it is
 * "what did this revision actually change", answered before spending a
 * generation on it.
 */

export type DiffKind = 'equal' | 'add' | 'remove' | 'change';

export interface DiffLine {
  readonly kind: DiffKind;
  /** Left-side text (`undefined` for an added line). */
  readonly left?: string;
  /** Right-side text (`undefined` for a removed line). */
  readonly right?: string;
  /** 1-based line number on the left, when present. */
  readonly leftNo?: number;
  /** 1-based line number on the right, when present. */
  readonly rightNo?: number;
}

export interface DiffStats {
  readonly equal: number;
  readonly added: number;
  readonly removed: number;
  readonly changed: number;
  readonly total: number;
  /** Fraction of lines that differ, 0–1. Empty drafts are 0. */
  readonly changedRatio: number;
}

export interface DiffResult {
  readonly lines: readonly DiffLine[];
  readonly stats: DiffStats;
}

/** Normalise for comparison: CRLF → LF, trailing whitespace off, blank edges dropped. */
export function normalizeLines(text: string): string[] {
  const lines = (text ?? '').replace(/\r\n?/g, '\n').split('\n').map((line) => line.replace(/\s+$/, ''));
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start]?.trim() === '') start += 1;
  while (end > start && lines[end - 1]?.trim() === '') end -= 1;
  return lines.slice(start, end);
}

interface Op {
  readonly kind: 'equal' | 'add' | 'remove';
  readonly left?: string;
  readonly right?: string;
  readonly leftNo?: number;
  readonly rightNo?: number;
}

/** Longest common subsequence over lines, computed as a suffix table. */
function lcsOps(left: readonly string[], right: readonly string[]): Op[] {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const table: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      const row = table[i];
      const next = table[i + 1];
      if (!row || !next) continue;
      row[j] = left[i] === right[j] ? (next[j + 1] ?? 0) + 1 : Math.max(next[j] ?? 0, row[j + 1] ?? 0);
    }
  }

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      ops.push({ kind: 'equal', left: left[i], right: right[j], leftNo: i + 1, rightNo: j + 1 });
      i += 1;
      j += 1;
    } else if ((table[i + 1]?.[j] ?? 0) >= (table[i]?.[j + 1] ?? 0)) {
      ops.push({ kind: 'remove', left: left[i], leftNo: i + 1 });
      i += 1;
    } else {
      ops.push({ kind: 'add', right: right[j], rightNo: j + 1 });
      j += 1;
    }
  }
  while (i < left.length) {
    ops.push({ kind: 'remove', left: left[i], leftNo: i + 1 });
    i += 1;
  }
  while (j < right.length) {
    ops.push({ kind: 'add', right: right[j], rightNo: j + 1 });
    j += 1;
  }
  return ops;
}

/**
 * Diff two lyric drafts.
 *
 * A removal immediately followed by an addition is reported as a `change`:
 * that is what a creator means by "I rewrote this line".
 */
export function diffLyrics(leftText: string, rightText: string): DiffResult {
  const left = normalizeLines(leftText);
  const right = normalizeLines(rightText);
  const ops = lcsOps(left, right);

  const lines: DiffLine[] = [];
  for (let index = 0; index < ops.length; index += 1) {
    const op = ops[index];
    if (!op) continue;
    const next = ops[index + 1];
    if (op.kind === 'remove' && next?.kind === 'add') {
      lines.push({ kind: 'change', left: op.left, right: next.right, leftNo: op.leftNo, rightNo: next.rightNo });
      index += 1;
      continue;
    }
    lines.push(op);
  }

  let equal = 0;
  let added = 0;
  let removed = 0;
  let changed = 0;
  for (const line of lines) {
    if (line.kind === 'equal') equal += 1;
    else if (line.kind === 'add') added += 1;
    else if (line.kind === 'remove') removed += 1;
    else changed += 1;
  }
  const total = lines.length;
  const differing = added + removed + changed;

  return {
    lines,
    stats: {
      equal,
      added,
      removed,
      changed,
      total,
      changedRatio: total === 0 ? 0 : differing / total,
    },
  };
}

export function summarizeDiff(result: DiffResult): string {
  const { equal, added, removed, changed, total } = result.stats;
  if (total === 0) return 'Both drafts are empty.';
  if (added + removed + changed === 0) return `No changes — ${equal} identical line${equal === 1 ? '' : 's'}.`;
  const parts = [`+${added}`, `-${removed}`];
  if (changed > 0) parts.push(`~${changed}`);
  return `${parts.join(' ')} across ${total} line${total === 1 ? '' : 's'} (${equal} unchanged).`;
}
