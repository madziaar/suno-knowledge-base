/**
 * Random style generator with lock & re-roll.
 *
 * Deterministic by seed: the same seed and the same locks always produce the
 * same style. That matters more than it sounds — "I liked that one, give me it
 * again but with a different mood" is only possible if the first one is
 * reproducible.
 *
 * Every pick is a *hint*, not a control tag. Nothing here claims Suno obeys it.
 */

export type Pillar = 'genre' | 'instrument' | 'mood' | 'vocal' | 'production';

export const PILLARS: readonly Pillar[] = ['genre', 'instrument', 'mood', 'vocal', 'production'];

export interface StylePool {
  readonly genre: readonly string[];
  readonly instrument: readonly string[];
  readonly mood: readonly string[];
  readonly vocal: readonly string[];
  readonly production: readonly string[];
}

export const SEED_POOL: StylePool = {
  genre: [
    'dream pop', 'shoegaze', 'synthwave', 'city pop', 'post-rock', 'lo-fi hip hop',
    'neo-soul', 'bossa nova', 'trip hop', 'folk noir', 'math rock', 'ambient techno',
    'dark wave', 'bluegrass', 'afrobeat', 'bedroom pop', 'chamber pop', 'industrial',
  ],
  instrument: [
    'warm analog synth', 'fretless bass', 'Rhodes piano', 'fingerpicked acoustic guitar',
    'brushed drums', 'string quartet', 'muted trumpet', '808 sub', 'pedal steel',
    'vibraphone', 'mellotron', 'hand percussion', 'electric sitar', 'granular pads',
  ],
  mood: [
    'melancholic', 'euphoric', 'wistful', 'tense', 'playful', 'hollow', 'tender',
    'cinematic', 'restless', 'serene', 'bittersweet', 'menacing', 'hopeful',
  ],
  vocal: [
    'breathy female vocal', 'falsetto male vocal', 'spoken word', 'duet',
    'layered harmonies', 'whispered vocal', 'belting chorus', 'vocoder',
    'no vocals', 'group chant',
  ],
  production: [
    'tape saturation', 'wide stereo reverb', 'dry intimate mix', 'sidechained',
    'gated drums', 'lo-fi bitcrush', 'vinyl crackle', 'wall of sound',
    'sparse arrangement', 'heavy compression', 'live room feel',
  ],
};

/** mulberry32 — 32 bits of state, no dependencies, identical across engines. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], rand: () => number): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(rand() * items.length) % items.length];
}

/** Fisher–Yates on a copy. */
export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export interface GenerateOptions {
  readonly seed?: number;
  readonly pool?: StylePool;
  /** Pillars the user pinned; they survive every re-roll. */
  readonly locked?: Partial<Record<Pillar, string>>;
  /** Extra values merged into the pool (the user's own favourites). */
  readonly extra?: Partial<Record<Pillar, readonly string[]>>;
}

export interface StyleRoll {
  readonly seed: number;
  readonly picks: Record<Pillar, string>;
  readonly style: string;
  readonly lockedKeys: readonly Pillar[];
}

/**
 * Produce one style string. Locked pillars are used verbatim; the rest are
 * drawn from the pool. Missing pool entries are skipped rather than filled
 * with an empty string, so a user who deletes every mood still gets a style.
 */
export function generateStyle(options: GenerateOptions = {}): StyleRoll {
  const pool = options.pool ?? SEED_POOL;
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rand = mulberry32(seed);
  const locked = options.locked ?? {};
  const picks = {} as Record<Pillar, string>;

  for (const pillar of PILLARS) {
    const pinned = locked[pillar]?.trim();
    if (pinned) {
      picks[pillar] = pinned;
      continue;
    }
    const values = [...(pool[pillar] ?? []), ...(options.extra?.[pillar] ?? [])];
    const choice = pick(values, rand);
    if (choice) picks[pillar] = choice;
  }

  const style = PILLARS.map((pillar) => picks[pillar])
    .filter((value): value is string => Boolean(value))
    .join(', ');

  return {
    seed,
    picks,
    style,
    lockedKeys: PILLARS.filter((pillar) => Boolean(locked[pillar]?.trim())),
  };
}

/** The next seed in sequence — what the re-roll button uses. */
export function nextSeed(seed: number): number {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}
