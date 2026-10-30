/**
 * CSV / JSON export.
 *
 * Quoting is the whole job: lyrics contain commas, quotes and newlines, and an
 * exporter that mangles them silently is worse than no exporter.
 */

export interface CsvOptions {
  /** Default `,`. */
  readonly delimiter?: string;
  /** Default `\r\n` (Excel-friendly). */
  readonly newline?: string;
}

export interface CsvColumn {
  readonly key: string;
  readonly header: string;
}

const NEEDS_QUOTING = /[",\r\n]/;

export function escapeCell(value: unknown, delimiter = ','): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  const needs = text.includes(delimiter) || NEEDS_QUOTING.test(text) || /^\s|\s$/.test(text);
  return needs ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: readonly Record<string, unknown>[], options: CsvOptions & { columns?: readonly CsvColumn[] } = {}): string {
  const delimiter = options.delimiter ?? ',';
  const newline = options.newline ?? '\r\n';
  const columns = options.columns ?? inferColumns(rows);
  const lines: string[] = [columns.map((column) => escapeCell(column.header, delimiter)).join(delimiter)];
  for (const row of rows) {
    lines.push(columns.map((column) => escapeCell(row[column.key], delimiter)).join(delimiter));
  }
  return lines.join(newline) + newline;
}

function inferColumns(rows: readonly Record<string, unknown>[]): CsvColumn[] {
  const seen: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.includes(key)) seen.push(key);
    }
  }
  return seen.map((key) => ({ key, header: key }));
}

/** Parse CSV back into a matrix. Handles quoted newlines and doubled quotes. */
export function parseCsv(text: string, delimiter = ','): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"' && cell === '') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}

export interface PromptRecordLike {
  readonly id: string;
  readonly title: string;
  readonly style: string;
  readonly lyrics: string;
  readonly tags?: readonly string[];
  readonly model?: string;
  readonly [key: string]: unknown;
}

export function toJsonExport(records: readonly PromptRecordLike[], pretty = true): string {
  return JSON.stringify({ schema: 'suno-helper/prompts@1', count: records.length, prompts: records }, null, pretty ? 2 : 0);
}

export function parseJsonExport(text: string): PromptRecordLike[] {
  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as PromptRecordLike[];
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { prompts?: unknown }).prompts)) {
      return (parsed as { prompts: PromptRecordLike[] }).prompts;
    }
    return [];
  } catch {
    return [];
  }
}

/** Sortable, filesystem-safe name: `prefix-2026-10-30-1412.csv`. */
export function exportFilename(prefix: string, now: Date = new Date()): string {
  const pad = (value: number) => value.toString().padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const safe = (prefix || 'export').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '');
  return `${safe}-${stamp}.csv`;
}
