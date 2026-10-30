/**
 * Local prompt library.
 *
 * `chrome.storage.local` behind a small typed store. Nothing here syncs, fetches
 * or phones home: the extension's whole privacy claim rests on the fact that
 * this is the only persistence layer in the product.
 */

import type { ModelId } from './limits';

import { removeStyle, upsertStyle, type StyleEntry } from './styleLibrary';

export const SCHEMA_VERSION = 1;

export interface PromptRecord {
  readonly id: string;
  readonly title: string;
  readonly style: string;
  readonly lyrics: string;
  readonly exclude: string;
  readonly tags: readonly string[];
  readonly model: ModelId;
  readonly notes: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly schemaVersion: number;
}

export interface Settings {
  readonly model: ModelId;
  readonly pace: string;
  readonly autoClean: boolean;
  readonly confirmDelete: boolean;
  readonly sort: 'recent' | 'title';
}

export const DEFAULT_SETTINGS: Settings = {
  model: 'v5.5',
  pace: 'midtempo',
  autoClean: true,
  confirmDelete: true,
  sort: 'recent',
};

const STYLES_KEY = 'userStyles';

export interface StorageLike {
  get(keys: string | string[] | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
}

/** In-memory store: tests and the first-run fallback. */
export class MemoryStorage implements StorageLike {
  private data: Record<string, unknown> = {};

  constructor(seed: Record<string, unknown> = {}) {
    this.data = { ...seed };
  }

  async get(keys: string | string[] | null): Promise<Record<string, unknown>> {
    if (keys === null) return { ...this.data };
    const list = Array.isArray(keys) ? keys : [keys];
    const out: Record<string, unknown> = {};
    for (const key of list) {
      if (key in this.data) out[key] = this.data[key];
    }
    return out;
  }

  async set(items: Record<string, unknown>): Promise<void> {
    this.data = { ...this.data, ...items };
  }

  async remove(keys: string | string[]): Promise<void> {
    const list = Array.isArray(keys) ? keys : [keys];
    const next = { ...this.data };
    for (const key of list) delete next[key];
    this.data = next;
  }
}

const LIBRARY_KEY = 'library';
const SETTINGS_KEY = 'settings';

/** Newest-first, then title — stable output for tests and the UI. */
function sortRecords(records: PromptRecord[]): PromptRecord[] {
  return [...records].sort((a, b) => b.updatedAt - a.updatedAt || a.title.localeCompare(b.title));
}

/** Migrate a stored record forward. Unknown/corrupt shapes return `null`. */
export function migrateRecord(record: unknown): PromptRecord | null {
  if (!record || typeof record !== 'object') return null;
  const raw = record as Partial<PromptRecord>;
  if (typeof raw.id !== 'string' || raw.id.length === 0) return null;
  const now = Date.now();
  return {
    id: raw.id,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'Untitled',
    style: typeof raw.style === 'string' ? raw.style : '',
    lyrics: typeof raw.lyrics === 'string' ? raw.lyrics : '',
    exclude: typeof raw.exclude === 'string' ? raw.exclude : '',
    tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    model: (typeof raw.model === 'string' ? raw.model : 'v5.5') as ModelId,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
    schemaVersion: SCHEMA_VERSION,
  };
}

export class PromptStore {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly storage: StorageLike, private readonly now: () => number = () => Date.now()) {}

  /** Serialise writes: read-modify-write is only safe one at a time. */
  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const next = this.queue.then(task, task);
    this.queue = next.catch(() => undefined);
    return next;
  }

  async getLibrary(): Promise<PromptRecord[]> {
    const raw = await this.storage.get(LIBRARY_KEY);
    const rows = Array.isArray(raw[LIBRARY_KEY]) ? (raw[LIBRARY_KEY] as unknown[]) : [];
    const records: PromptRecord[] = [];
    for (const row of rows) {
      const migrated = migrateRecord(row);
      if (migrated) records.push(migrated);
    }
    return sortRecords(records);
  }

  async savePrompt(input: Omit<PromptRecord, 'createdAt' | 'updatedAt' | 'schemaVersion'> & Partial<Pick<PromptRecord, 'createdAt'>>): Promise<PromptRecord> {
    return this.enqueue(async () => {
      const library = await this.getLibrary();
      const stamp = this.now();
      const existing = library.find((record) => record.id === input.id);
      const record: PromptRecord = {
        ...input,
        tags: [...input.tags],
        createdAt: existing?.createdAt ?? input.createdAt ?? stamp,
        updatedAt: stamp,
        schemaVersion: SCHEMA_VERSION,
      };
      const next = existing ? library.map((item) => (item.id === record.id ? record : item)) : [record, ...library];
      await this.storage.set({ [LIBRARY_KEY]: next });
      return record;
    });
  }

  async deletePrompt(id: string): Promise<boolean> {
    return this.enqueue(async () => {
      const library = await this.getLibrary();
      const next = library.filter((record) => record.id !== id);
      if (next.length === library.length) return false;
      await this.storage.set({ [LIBRARY_KEY]: next });
      return true;
    });
  }

  async clearLibrary(): Promise<void> {
    return this.enqueue(async () => {
      await this.storage.remove(LIBRARY_KEY);
    });
  }

  async getSettings(): Promise<Settings> {
    const raw = await this.storage.get(SETTINGS_KEY);
    const stored = (raw[SETTINGS_KEY] ?? {}) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  async saveSettings(patch: Partial<Settings>): Promise<Settings> {
    return this.enqueue(async () => {
      const next = { ...(await this.getSettings()), ...patch };
      await this.storage.set({ [SETTINGS_KEY]: next });
      return next;
    });
  }

  /** The user's own style entries. Seed entries live in the bundle, not here. */
  async getStyles(): Promise<StyleEntry[]> {
    const raw = await this.storage.get(STYLES_KEY);
    const rows = Array.isArray(raw[STYLES_KEY]) ? (raw[STYLES_KEY] as unknown[]) : [];
    const entries: StyleEntry[] = [];
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      const value = row as Partial<StyleEntry>;
      if (typeof value.id !== 'string' || typeof value.style !== 'string') continue;
      entries.push({
        id: value.id,
        name: typeof value.name === 'string' && value.name.trim() ? value.name : value.id,
        style: value.style,
        tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === 'string') : [],
        source: 'user',
      });
    }
    return entries;
  }

  async saveStyle(entry: StyleEntry): Promise<StyleEntry> {
    return this.enqueue(async () => {
      const current = await this.getStyles();
      const next = upsertStyle(current, { ...entry, source: 'user' });
      await this.storage.set({ [STYLES_KEY]: next });
      return entry;
    });
  }

  async deleteStyle(id: string): Promise<boolean> {
    return this.enqueue(async () => {
      const current = await this.getStyles();
      const next = removeStyle(current, id);
      if (next.length === current.length) return false;
      await this.storage.set({ [STYLES_KEY]: next });
      return true;
    });
  }

  async exportAll(): Promise<{ schema: string; exportedAt: string; library: PromptRecord[]; settings: Settings }> {
    return {
      schema: `suno-helper/library@${SCHEMA_VERSION}`,
      exportedAt: new Date(this.now()).toISOString(),
      library: await this.getLibrary(),
      settings: await this.getSettings(),
    };
  }

  /** Import an export bundle or a bare array. Duplicate ids are replaced. */
  async importAll(payload: unknown): Promise<{ imported: number; skipped: number }> {
    const rows = Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && Array.isArray((payload as { library?: unknown }).library)
        ? ((payload as { library: unknown[] }).library)
        : [];
    return this.enqueue(async () => {
      const library = await this.getLibrary();
      const byId = new Map(library.map((record) => [record.id, record]));
      let imported = 0;
      let skipped = 0;
      for (const row of rows) {
        const record = migrateRecord(row);
        if (!record) {
          skipped += 1;
          continue;
        }
        byId.set(record.id, record);
        imported += 1;
      }
      await this.storage.set({ [LIBRARY_KEY]: sortRecords([...byId.values()]) });
      return { imported, skipped };
    });
  }
}

/** `chrome.storage.local` wrapper. Throws if called outside an extension context. */
export function chromeStorage(): StorageLike {
  const api = (globalThis as { chrome?: typeof chrome }).chrome;
  if (!api?.storage?.local) {
    // Tests and the dev server both land here; memory keeps the UI usable.
    return new MemoryStorage();
  }
  const local = api.storage.local;
  return {
    get: (keys) => local.get(keys ?? null) as Promise<Record<string, unknown>>,
    set: (items) => local.set(items) as unknown as Promise<void>,
    remove: (keys) => local.remove(keys) as unknown as Promise<void>,
  };
}
