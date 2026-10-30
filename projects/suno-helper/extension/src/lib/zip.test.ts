import { describe, expect, it } from 'vitest';

import { buildZip, crc32, isSafeEntryName, readZipDirectory } from './zip';

const utf8 = (value: string) => new TextEncoder().encode(value);

describe('crc32', () => {
  it('matches the reference vector', () => {
    // The canonical check value for "123456789".
    expect(crc32(utf8('123456789'))).toBe(0xcbf43926);
  });

  it('is zero for empty input', () => {
    expect(crc32(new Uint8Array())).toBe(0);
  });
});

describe('isSafeEntryName', () => {
  it('accepts ordinary names', () => {
    expect(isSafeEntryName('playlist/track.mp3')).toBe(true);
  });

  it('rejects traversal and absolute paths', () => {
    expect(isSafeEntryName('../escape')).toBe(false);
    expect(isSafeEntryName('/etc/passwd')).toBe(false);
    expect(isSafeEntryName('C:\\windows')).toBe(false);
  });
});

describe('buildZip', () => {
  it('writes local, central and end records', () => {
    const zip = buildZip([{ name: 'a.txt', data: utf8('hello') }]);
    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
    const entries = readZipDirectory(zip);
    expect(entries).toEqual([{ name: 'a.txt', size: 5, crc: crc32(utf8('hello')) }]);
  });

  it('round-trips several entries in order', () => {
    const zip = buildZip([
      { name: 'one.txt', data: utf8('1') },
      { name: 'folder/two.txt', data: utf8('22') },
    ]);
    expect(readZipDirectory(zip).map((entry) => entry.name)).toEqual(['one.txt', 'folder/two.txt']);
  });

  it('is byte-reproducible with a fixed timestamp', () => {
    const at = new Date(1980, 0, 1);
    const a = buildZip([{ name: 'x', data: utf8('y') }], { modifiedAt: at });
    const b = buildZip([{ name: 'x', data: utf8('y') }], { modifiedAt: at });
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it('refuses to write an escaping path', () => {
    expect(() => buildZip([{ name: '../evil', data: utf8('x') }])).toThrow(/unsafe/);
  });

  it('writes a valid empty archive', () => {
    const zip = buildZip([]);
    expect(readZipDirectory(zip)).toEqual([]);
  });
});
