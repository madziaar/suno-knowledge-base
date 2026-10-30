import { describe, expect, it } from 'vitest';

import { escapeCell, exportFilename, parseCsv, parseJsonExport, toCsv, toJsonExport } from './csv';

describe('escapeCell', () => {
  it('leaves plain text alone', () => {
    expect(escapeCell('indie pop')).toBe('indie pop');
  });

  it('quotes commas', () => {
    expect(escapeCell('a,b')).toBe('"a,b"');
  });

  it('doubles embedded quotes', () => {
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
  });

  it('quotes newlines', () => {
    expect(escapeCell('line one\nline two')).toBe('"line one\nline two"');
  });

  it('quotes leading or trailing spaces', () => {
    expect(escapeCell(' pad ')).toBe('" pad "');
  });

  it('renders null and undefined as empty', () => {
    expect(escapeCell(null)).toBe('');
    expect(escapeCell(undefined)).toBe('');
  });

  it('stringifies numbers and booleans', () => {
    expect(escapeCell(42)).toBe('42');
    expect(escapeCell(false)).toBe('false');
  });
});

describe('toCsv', () => {
  const rows = [
    { title: 'One', lyrics: 'a,b', tags: 'pop|rock' },
    { title: 'Two', lyrics: 'say "x"', tags: '' },
  ];

  it('emits a header and one line per row', () => {
    const csv = toCsv(rows);
    const lines = csv.trimEnd().split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('title,lyrics,tags');
  });

  it('quotes cells that need it', () => {
    expect(toCsv(rows)).toContain('"a,b"');
  });

  it('supports explicit columns and order', () => {
    const csv = toCsv(rows, { columns: [{ key: 'tags', header: 'Tags' }, { key: 'title', header: 'Title' }] });
    expect(csv.split('\r\n')[0]).toBe('Tags,Title');
  });

  it('supports a custom delimiter', () => {
    expect(toCsv(rows, { delimiter: ';' }).split('\r\n')[0]).toBe('title;lyrics;tags');
  });

  it('exports a header-only file for no rows', () => {
    const csv = toCsv([], { columns: [{ key: 'a', header: 'A' }] });
    expect(csv.trimEnd()).toBe('A');
  });
});

describe('parseCsv', () => {
  it('round-trips quoted newlines, commas and quotes', () => {
    const rows = [{ title: 'T', lyrics: 'one, two\nsay "hi"' }];
    const parsed = parseCsv(toCsv(rows));
    expect(parsed[0]).toEqual(['title', 'lyrics']);
    expect(parsed[1]).toEqual(['T', 'one, two\nsay "hi"']);
  });

  it('handles an empty string', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('keeps empty cells', () => {
    expect(parseCsv('a,,c')).toEqual([['a', '', 'c']]);
  });

  it('parses a custom delimiter', () => {
    expect(parseCsv('a;b', ';')).toEqual([['a', 'b']]);
  });

  it('does not assume our column order', () => {
    const rows = parseCsv('x,y\n1,2');
    expect(rows[1]).toEqual(['1', '2']);
  });
});

describe('json export', () => {
  it('wraps records with a schema and count', () => {
    const payload = JSON.parse(toJsonExport([{ id: 'a', title: 't', style: '', lyrics: '' }])) as { schema: string; count: number };
    expect(payload.schema).toBe('suno-helper/prompts@1');
    expect(payload.count).toBe(1);
  });

  it('parses its own output', () => {
    const records = [{ id: 'a', title: 't', style: 's', lyrics: 'l' }];
    expect(parseJsonExport(toJsonExport(records))).toEqual(records);
  });

  it('parses a bare array', () => {
    expect(parseJsonExport('[{"id":"a"}]')).toHaveLength(1);
  });

  it('returns an empty list for junk', () => {
    expect(parseJsonExport('not json')).toEqual([]);
    expect(parseJsonExport('{}')).toEqual([]);
  });
});

describe('exportFilename', () => {
  it('is sortable and safe', () => {
    const name = exportFilename('Suno Helper / Library', new Date(2026, 9, 30, 14, 12));
    expect(name).toBe('Suno-Helper-Library-2026-10-30-1412.csv');
  });

  it('falls back for an empty prefix', () => {
    expect(exportFilename('')).toMatch(/^export-/);
  });
});
