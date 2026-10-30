/**
 * A searchable library of style prompts — seeded with ours, extensible with
 * the user's.
 *
 * The competitor hosts this as a website. We keep it local: the seed ships in
 * the bundle, the user's additions live in `chrome.storage`, and search is a
 * pure function so it can be tested without a browser.
 *
 * Every seed entry is a *style string someone found useful*, not a claim about
 * what Suno will do with it.
 */

export interface StyleEntry {
  readonly id: string;
  readonly name: string;
  readonly style: string;
  readonly tags: readonly string[];
  readonly source: 'seed' | 'user';
}

export const SEED_STYLES: readonly StyleEntry[] = [
  {
    id: 'seed-late-night-drive',
    name: 'Late night drive',
    style: 'synthwave, warm analog synth, arpeggiated bass, breathy female vocal, tape saturation, wide stereo reverb',
    tags: ['synthwave', '80s', 'night', 'retro'],
    source: 'seed',
  },
  {
    id: 'seed-rainy-window',
    name: 'Rainy window',
    style: 'lo-fi hip hop, Rhodes piano, vinyl crackle, brushed drums, instrumental',
    tags: ['lofi', 'chill', 'study', 'instrumental'],
    source: 'seed',
  },
  {
    id: 'seed-cathedral',
    name: 'Cathedral',
    style: 'chamber pop, string quartet, layered harmonies, wide stereo reverb, cinematic',
    tags: ['orchestral', 'cinematic', 'choir', 'grand'],
    source: 'seed',
  },
  {
    id: 'seed-bar-fight',
    name: 'Bar fight',
    style: 'garage rock, distorted baritone guitar, live room feel, shouted group vocals, gated drums',
    tags: ['rock', 'garage', 'loud', 'punk'],
    source: 'seed',
  },
  {
    id: 'seed-sun-bleached',
    name: 'Sun bleached',
    style: 'bossa nova, nylon guitar, brushed drums, muted trumpet, tender',
    tags: ['bossa', 'latin', 'warm', 'acoustic'],
    source: 'seed',
  },
  {
    id: 'seed-machine-heart',
    name: 'Machine heart',
    style: 'industrial, 808 sub, vocoder, heavy compression, menacing',
    tags: ['industrial', 'dark', 'electronic', 'aggressive'],
    source: 'seed',
  },
  {
    id: 'seed-front-porch',
    name: 'Front porch',
    style: 'bluegrass, fingerpicked acoustic guitar, pedal steel, duet, live room feel',
    tags: ['country', 'folk', 'acoustic', 'americana'],
    source: 'seed',
  },
  {
    id: 'seed-tokyo-1985',
    name: 'Tokyo, 1985',
    style: 'city pop, fretless bass, electric sitar, belting chorus, gated drums',
    tags: ['citypop', 'japanese', '80s', 'funk'],
    source: 'seed',
  },
  {
    id: 'seed-underwater',
    name: 'Underwater',
    style: 'ambient techno, granular pads, no vocals, sparse arrangement',
    tags: ['ambient', 'techno', 'instrumental', 'calm'],
    source: 'seed',
  },
  {
    id: 'seed-last-call',
    name: 'Last call',
    style: 'folk noir, muted trumpet, whispered vocal, dry intimate mix, bittersweet',
    tags: ['folk', 'jazz', 'sad', 'intimate'],
    source: 'seed',
  },
  {
    id: 'seed-overdrive',
    name: 'Overdrive',
    style: 'math rock, tapped electric guitar, syncopated drums, instrumental, restless',
    tags: ['mathrock', 'guitar', 'technical', 'instrumental'],
    source: 'seed',
  },
  {
    id: 'seed-velvet',
    name: 'Velvet',
    style: 'neo-soul, Rhodes piano, falsetto male vocal, warm analog synth, tender',
    tags: ['soul', 'rnb', 'smooth', 'warm'],
    source: 'seed',
  },
];

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff\u3040-\u9fff]+/)
    .filter((token) => token.length > 1);
}

/**
 * Score = name match (3) > tag match (2) > style match (1), then a small bonus
 * for an exact tag. Returns everything for an empty query so the panel can
 * render a browsable list.
 */
export function searchStyles(entries: readonly StyleEntry[], query: string): StyleEntry[] {
  const terms = tokens(query);
  if (terms.length === 0) return [...entries];

  const scored = entries.map((entry) => {
    const name = entry.name.toLowerCase();
    const tags = entry.tags.map((tag) => tag.toLowerCase());
    const style = entry.style.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (name.includes(term)) score += 3;
      if (tags.some((tag) => tag.includes(term))) score += 2;
      if (style.includes(term)) score += 1;
    }
    return { entry, score };
  });

  return scored
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .map((row) => row.entry);
}

/** Add or replace by id, newest first, user entries only. */
export function upsertStyle(entries: readonly StyleEntry[], entry: StyleEntry): StyleEntry[] {
  const without = entries.filter((existing) => existing.id !== entry.id);
  return [entry, ...without];
}

export function removeStyle(entries: readonly StyleEntry[], id: string): StyleEntry[] {
  return entries.filter((entry) => entry.id !== id);
}

/** Stable id for a user entry: derived from the name, so re-saving updates. */
export function userStyleId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `user-${slug || Date.now().toString(36)}`;
}

/** Everything the panel shows, seed first then the user's own. */
export function allStyles(userEntries: readonly StyleEntry[]): StyleEntry[] {
  return [...userEntries, ...SEED_STYLES];
}

export function stylesCsv(entries: readonly StyleEntry[]): string {
  const escape = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const rows = [['name', 'style', 'tags', 'source']];
  for (const entry of entries) {
    rows.push([entry.name, entry.style, entry.tags.join(' '), entry.source]);
  }
  return rows.map((row) => row.map(escape).join(',')).join('\n') + '\n';
}
