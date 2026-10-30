/**
 * Five-Pillar Prompt Builder.
 *
 * A style string is five independent decisions — genre, instrumentation, mood,
 * vocal, production. Keeping them as separate axes is what makes iteration
 * possible: lock the four you like, re-roll the fifth.
 */

import { charCount } from './limits';

export type PillarId = 'genre' | 'instrumentation' | 'mood' | 'vocal' | 'production';

export interface Pillar {
  readonly id: PillarId;
  readonly label: string;
  readonly hint: string;
  readonly options: readonly string[];
}

/** Order is fixed: the same state always renders the same string. */
export const PILLARS: readonly Pillar[] = [
  {
    id: 'genre',
    label: 'Genre',
    hint: 'What shelf is this on? One or two words.',
    options: [
      'indie pop',
      'synthwave',
      'lo-fi hip hop',
      'alt rock',
      'chamber folk',
      'darkwave',
      'afrobeat',
      'city pop',
      'post-rock',
      'trip hop',
      'americana',
      'drum and bass',
    ],
  },
  {
    id: 'instrumentation',
    label: 'Instrumentation',
    hint: 'Two or three concrete instruments beat ten adjectives.',
    options: [
      'analog synths',
      'warm Rhodes piano',
      'fingerpicked acoustic guitar',
      'sub bass',
      'brushed drums',
      'strings section',
      'muted trumpet',
      '808s',
      'vintage organ',
      'tabla percussion',
      'arpeggiated pads',
      'slide guitar',
    ],
  },
  {
    id: 'mood',
    label: 'Mood',
    hint: 'One emotional direction. Contradictions confuse the model.',
    options: [
      'melancholic',
      'hopeful',
      'nostalgic',
      'tense',
      'euphoric',
      'wistful',
      'restless',
      'serene',
      'defiant',
      'dreamy',
    ],
  },
  {
    id: 'vocal',
    label: 'Vocal',
    hint: 'Gender, register and delivery — or "instrumental".',
    options: [
      'soft female vocals',
      'deep male baritone',
      'breathy androgynous vocals',
      'layered harmonies',
      'spoken word verses',
      'falsetto hooks',
      'gritty rasp',
      'choir backing',
      'no vocals, instrumental',
    ],
  },
  {
    id: 'production',
    label: 'Production',
    hint: 'Era and texture: the thing reviewers call "the sound".',
    options: [
      'tape saturation',
      'wide stereo reverb',
      'dry 70s mix',
      'modern loud master',
      'lo-fi cassette hiss',
      'cinematic dynamics',
      'sidechained and glossy',
      'intimate close mic',
    ],
  },
];

export interface StyleState {
  readonly seed: number;
  readonly values: Record<PillarId, readonly string[]>;
  readonly locked: Record<PillarId, boolean>;
}

export const EMPTY_STYLE_STATE: StyleState = {
  seed: 1,
  values: { genre: [], instrumentation: [], mood: [], vocal: [], production: [] },
  locked: { genre: false, instrumentation: false, mood: false, vocal: false, production: false },
};

/** Deterministic 32-bit PRNG. Reproducible re-rolls are the whole point. */
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

export function buildStyle(state: StyleState, options: { exclude?: readonly PillarId[] } = {}): string {
  const excluded = new Set(options.exclude ?? []);
  const parts: string[] = [];
  for (const pillar of PILLARS) {
    if (excluded.has(pillar.id)) continue;
    parts.push(...state.values[pillar.id]);
  }
  return parts.join(', ');
}

export interface RollOptions {
  /** Seed to use. Defaults to `state.seed + 1`, so successive rolls differ. */
  readonly seed?: number;
  /** Values picked per pillar. Default 1 for genre/mood/vocal, 2 for instruments/production. */
  readonly pick?: Partial<Record<PillarId, number>>;
}

const DEFAULT_PICK: Record<PillarId, number> = {
  genre: 1,
  instrumentation: 2,
  mood: 1,
  vocal: 1,
  production: 1,
};

/** Re-roll the unlocked pillars. Locked pillars are carried over untouched. */
export function rollStyle(state: StyleState, options: RollOptions = {}): StyleState {
  const seed = options.seed ?? state.seed + 1;
  const rng = mulberry32(seed);
  const values = { ...state.values };

  for (const pillar of PILLARS) {
    if (state.locked[pillar.id]) continue;
    const count = Math.max(1, Math.floor(options.pick?.[pillar.id] ?? DEFAULT_PICK[pillar.id]));
    const pool = [...pillar.options];
    const picked: string[] = [];
    for (let index = 0; index < count && pool.length > 0; index += 1) {
      const choice = Math.floor(rng() * pool.length);
      const [value] = pool.splice(choice, 1);
      if (value) picked.push(value);
    }
    values[pillar.id] = picked;
  }

  return { seed, values, locked: { ...state.locked } };
}

export function toggleLock(state: StyleState, pillar: PillarId): StyleState {
  return { ...state, locked: { ...state.locked, [pillar]: !state.locked[pillar] } };
}

export function isComplete(state: StyleState): boolean {
  return missingPillars(state).length === 0;
}

export function missingPillars(state: StyleState): PillarId[] {
  return PILLARS.filter((pillar) => (state.values[pillar.id] ?? []).length === 0).map((pillar) => pillar.id);
}

export interface PillarAudit {
  readonly pillar: PillarId;
  readonly count: number;
  readonly status: 'empty' | 'thin' | 'ok' | 'crowded';
  readonly note: string;
}

/** Per-pillar health, for the little dots next to each lock button. */
export function auditStyle(state: StyleState): readonly PillarAudit[] {
  return PILLARS.map((pillar) => {
    const count = (state.values[pillar.id] ?? []).length;
    if (count === 0) {
      return { pillar: pillar.id, count, status: 'empty' as const, note: `Add a ${pillar.label.toLowerCase()}.` };
    }
    // Genre and vocal are legitimately single-valued; instrumentation, mood and
    // production read thin with only one tag.
    if (count === 1 && (pillar.id === 'instrumentation' || pillar.id === 'mood' || pillar.id === 'production')) {
      return { pillar: pillar.id, count, status: 'thin' as const, note: 'One more value would help.' };
    }
    if (count > 3) {
      return { pillar: pillar.id, count, status: 'crowded' as const, note: 'Trim this — it dilutes the others.' };
    }
    return { pillar: pillar.id, count, status: 'ok' as const, note: 'Good.' };
  });
}

export function styleChars(state: StyleState, exclude?: readonly PillarId[]): number {
  return charCount(buildStyle(state, exclude ? { exclude } : {}));
}
