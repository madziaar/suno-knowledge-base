import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS, MemoryStorage, PromptStore, SCHEMA_VERSION, chromeStorage, migrateRecord } from './storage';

const base = {
  id: 'p1',
  title: 'Night Drive',
  style: 'indie pop, analog synths',
  lyrics: '[Verse]\nhello',
  exclude: 'banjo',
  tags: ['indie pop'],
  model: 'v5.5' as const,
  notes: '',
};

function makeStore(seed: Record<string, unknown> = {}, now = 1000) {
  const storage = new MemoryStorage(seed);
  let clock = now;
  const store = new PromptStore(storage, () => (clock += 1));
  return { storage, store };
}

describe('MemoryStorage', () => {
  it('gets, sets and removes keys', async () => {
    const storage = new MemoryStorage({ a: 1 });
    await storage.set({ b: 2 });
    expect(await storage.get(['a', 'b'])).toEqual({ a: 1, b: 2 });
    await storage.remove('a');
    expect(await storage.get('a')).toEqual({});
  });

  it('returns everything for null', async () => {
    const storage = new MemoryStorage({ a: 1, b: 2 });
    expect(Object.keys(await storage.get(null))).toEqual(['a', 'b']);
  });
});

describe('migrateRecord', () => {
  it('fills defaults for a sparse record', () => {
    const migrated = migrateRecord({ id: 'x' });
    expect(migrated).toMatchObject({ id: 'x', title: 'Untitled', style: '', schemaVersion: SCHEMA_VERSION });
  });

  it('rejects records without an id', () => {
    expect(migrateRecord({ title: 'no id' })).toBeNull();
    expect(migrateRecord(null)).toBeNull();
    expect(migrateRecord('nope')).toBeNull();
  });

  it('drops non-string tags', () => {
    expect(migrateRecord({ id: 'x', tags: ['a', 3, null] })?.tags).toEqual(['a']);
  });
});

describe('PromptStore', () => {
  it('starts empty with default settings', async () => {
    const { store } = makeStore();
    expect(await store.getLibrary()).toEqual([]);
    expect(await store.getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('saves and lists prompts newest first', async () => {
    const { store } = makeStore();
    await store.savePrompt({ ...base, id: 'p1', title: 'one' });
    await store.savePrompt({ ...base, id: 'p2', title: 'two' });
    const library = await store.getLibrary();
    expect(library.map((record) => record.title)).toEqual(['two', 'one']);
    expect(library[0]?.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('updates in place and keeps createdAt', async () => {
    const { store } = makeStore();
    const first = await store.savePrompt({ ...base });
    const second = await store.savePrompt({ ...base, title: 'Renamed' });
    const library = await store.getLibrary();
    expect(library).toHaveLength(1);
    expect(second.title).toBe('Renamed');
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.updatedAt).toBeGreaterThan(first.updatedAt);
  });

  it('deletes and reports a miss', async () => {
    const { store } = makeStore();
    await store.savePrompt({ ...base });
    expect(await store.deletePrompt('p1')).toBe(true);
    expect(await store.deletePrompt('nope')).toBe(false);
    expect(await store.getLibrary()).toEqual([]);
  });

  it('clears the library', async () => {
    const { store } = makeStore();
    await store.savePrompt({ ...base });
    await store.clearLibrary();
    expect(await store.getLibrary()).toEqual([]);
  });

  it('skips corrupt stored rows instead of throwing', async () => {
    const { store } = makeStore({ library: [{ id: 'good' }, { nope: true }, null] });
    const library = await store.getLibrary();
    expect(library.map((record) => record.id)).toEqual(['good']);
  });

  it('merges settings patches', async () => {
    const { store } = makeStore();
    const next = await store.saveSettings({ model: 'v5', autoClean: false });
    expect(next.model).toBe('v5');
    expect(next.pace).toBe(DEFAULT_SETTINGS.pace);
    expect((await store.getSettings()).autoClean).toBe(false);
  });

  it('exports and re-imports a bundle', async () => {
    const { store } = makeStore();
    await store.savePrompt({ ...base });
    const bundle = await store.exportAll();
    expect(bundle.schema).toBe(`suno-helper/library@${SCHEMA_VERSION}`);

    const { store: other } = makeStore();
    const result = await other.importAll(bundle);
    expect(result).toEqual({ imported: 1, skipped: 0 });
    expect((await other.getLibrary())[0]?.title).toBe('Night Drive');
  });

  it('imports a bare array and counts skips', async () => {
    const { store } = makeStore();
    const result = await store.importAll([{ id: 'a' }, { nothing: true }]);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
  });

  it('imports nothing from junk', async () => {
    const { store } = makeStore();
    expect(await store.importAll({ nope: 1 })).toEqual({ imported: 0, skipped: 0 });
  });

  it('replaces a record with the same id on import', async () => {
    const { store } = makeStore();
    await store.savePrompt({ ...base, title: 'Old' });
    await store.importAll([{ ...base, title: 'New' }]);
    const library = await store.getLibrary();
    expect(library).toHaveLength(1);
    expect(library[0]?.title).toBe('New');
  });

  it('serialises concurrent writes', async () => {
    const { store } = makeStore();
    await Promise.all([
      store.savePrompt({ ...base, id: 'a', title: 'a' }),
      store.savePrompt({ ...base, id: 'b', title: 'b' }),
      store.savePrompt({ ...base, id: 'c', title: 'c' }),
    ]);
    expect(await store.getLibrary()).toHaveLength(3);
  });
});

describe('chromeStorage', () => {
  it('falls back to memory outside an extension', async () => {
    const storage = chromeStorage();
    await storage.set({ probe: 1 });
    expect(await storage.get('probe')).toEqual({ probe: 1 });
  });
});
