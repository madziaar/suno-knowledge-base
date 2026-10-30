/**
 * Structure tag helper.
 *
 * Suno took a step back from section tags in v4.5, then brought them back for
 * v5 — so the honest position is "these help, they are not switches". What this
 * module does is mechanical and useful either way: take an untagged lyric and
 * put standard `[Verse]` / `[Chorus]` headings where a song of this shape would
 * have them, or take a template and show the writer what is still empty.
 */

export interface SectionTemplate {
  readonly id: string;
  readonly name: string;
  /** In order. `Instrumental` sections are allowed to stay empty. */
  readonly sections: readonly string[];
  readonly note: string;
}

export const TEMPLATES: readonly SectionTemplate[] = [
  {
    id: 'pop',
    name: 'Radio pop',
    sections: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    note: 'Two verses, three choruses, one pre-chorus hook that earns its length.',
  },
  {
    id: 'rock',
    name: 'Rock',
    sections: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Guitar Solo', 'Chorus', 'Outro'],
    note: 'The solo replaces the bridge; the last chorus can be double-length.',
  },
  {
    id: 'ballad',
    name: 'Ballad',
    sections: ['Verse 1', 'Verse 2', 'Chorus', 'Verse 3', 'Chorus', 'Bridge', 'Chorus'],
    note: 'Three verses before the first chorus. Slow, so it can afford them.',
  },
  {
    id: 'edm',
    name: 'EDM',
    sections: ['Intro', 'Build', 'Drop', 'Verse', 'Build', 'Drop', 'Breakdown', 'Drop', 'Outro'],
    note: 'Lyrics live in the verse and breakdown; drops are instrumental.',
  },
  {
    id: 'hiphop',
    name: 'Hip hop',
    sections: ['Intro', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Verse 3', 'Hook', 'Outro'],
    note: 'Three verses, a hook that stays identical every time.',
  },
  {
    id: 'folk',
    name: 'Folk',
    sections: ['Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Verse 3', 'Chorus'],
    note: 'No bridge, no intro. Three chords and the truth.',
  },
];

/** Sections that may legitimately contain no lyrics. */
export const INSTRUMENTAL_SECTIONS = new Set(['Intro', 'Outro', 'Guitar Solo', 'Drop', 'Build', 'Breakdown', 'Interlude']);

const TAG_LINE = /^\s*[[(【]\s*([^\])】]{1,40})\s*[\])】]\s*$/;

export interface AppliedStructure {
  readonly text: string;
  readonly sectionsUsed: number;
  readonly emptySections: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Insert template headings into an untagged lyric.
 *
 * Lines are dealt out in order to the non-instrumental sections, in proportion
 * to how many lines each section should carry (verses carry more than choruses
 * because choruses repeat). If the lyric already has tags we leave it alone and
 * say so — silently double-tagging a lyric is worse than doing nothing.
 */
export function applyTemplate(lyrics: string, template: SectionTemplate): AppliedStructure {
  const lines = lyrics
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const warnings: string[] = [];
  if (lines.some((line) => TAG_LINE.test(line))) {
    return {
      text: lyrics,
      sectionsUsed: 0,
      emptySections: [],
      warnings: ['Lyric already tagged — left untouched. Clear the tags to re-apply.'],
    };
  }
  if (lines.length === 0) {
    return { text: lyrics, sectionsUsed: 0, emptySections: [], warnings: ['Nothing to tag.'] };
  }

  const singable = template.sections.filter((section) => !INSTRUMENTAL_SECTIONS.has(section));
  if (lines.length < singable.length) {
    warnings.push(
      `Only ${lines.length} line(s) for ${singable.length} lyric section(s); some sections will be left empty.`,
    );
  }

  // Weights: a verse takes ~1.6× a chorus, choruses repeat so carry less.
  const weightOf = (section: string) => {
    if (section.startsWith('Verse')) return 1.6;
    if (section.startsWith('Bridge') || section.startsWith('Breakdown')) return 1.2;
    return 1;
  };
  const totalWeight = singable.reduce((sum, section) => sum + weightOf(section), 0);

  const chunks: string[][] = [];
  let cursor = 0;
  for (let i = 0; i < singable.length; i += 1) {
    const remainingSections = singable.length - i;
    const remainingLines = lines.length - cursor;
    const raw = Math.round((weightOf(singable[i]!) / totalWeight) * lines.length);
    // Never starve the sections after this one: each needs at least one line.
    const take = Math.max(0, Math.min(raw, remainingLines - (remainingSections - 1)));
    chunks.push(lines.slice(cursor, cursor + take));
    cursor += take;
  }
  // Anything left over (rounding) goes to the final section.
  if (cursor < lines.length) chunks[chunks.length - 1]!.push(...lines.slice(cursor));

  const blocks: string[] = [];
  const emptySections: string[] = [];
  let used = 0;
  let singableIndex = 0;
  for (const section of template.sections) {
    // Repeated sections (`Chorus` × 3) each get their own chunk — matching on
    // the name with `indexOf` handed every chorus the first chorus's lines and
    // silently dropped the rest.
    const body = INSTRUMENTAL_SECTIONS.has(section) ? [] : (chunks[singableIndex++] ?? []);
    if (!INSTRUMENTAL_SECTIONS.has(section)) used += 1;
    if (body.length === 0 && !INSTRUMENTAL_SECTIONS.has(section)) emptySections.push(section);
    blocks.push(`[${section}]${body.length > 0 ? `\n${body.join('\n')}` : ''}`);
  }

  return {
    text: blocks.join('\n\n') + '\n',
    sectionsUsed: used,
    emptySections,
    warnings,
  };
}

/** Tags already present, in order of appearance, de-duplicated. */
export function detectSections(lyrics: string): string[] {
  const seen = new Set<string>();
  for (const line of lyrics.replace(/\r\n?/g, '\n').split('\n')) {
    const match = line.match(TAG_LINE);
    if (match) seen.add(match[1]!.trim());
  }
  return [...seen];
}

/** Which template fits a lyric of this length, without over-promising. */
export function suggestTemplate(lineCount: number): SectionTemplate {
  if (lineCount <= 12) return TEMPLATES.find((template) => template.id === 'folk')!;
  if (lineCount <= 24) return TEMPLATES.find((template) => template.id === 'rock')!;
  return TEMPLATES.find((template) => template.id === 'pop')!;
}
