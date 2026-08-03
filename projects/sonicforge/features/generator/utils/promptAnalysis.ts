
import { GeneratedPrompt, Platform, PromptQualityScore, PromptComparison, GenreTemplate } from '../../../types';
import { validateSunoPrompt } from './sunoValidator';
import { diffStyleStrings } from './promptDiff';
import { parseStylePrompt, analyzeLyrics } from './promptParser';
import { GENRE_DATABASE } from '../data/genreDatabase';
import { capitalize } from '../../../lib/utils';

/**
 * 1. Scores a GeneratedPrompt based on Suno/Riffusion best practices.
 */
export const scorePrompt = (prompt: GeneratedPrompt, platform: Platform = 'suno'): PromptQualityScore => {
  // Use the advanced validator which calculates scores, issues, conflicts, and suggestions
  const validatorResult = validateSunoPrompt(prompt);

  // Map grade based on total score
  let grade: string;
  const s = validatorResult.score;
  
  if (s >= 95) grade = 'S';
  else if (s >= 90) grade = 'A+';
  else if (s >= 80) grade = 'A';
  else if (s >= 70) grade = 'B';
  else if (s >= 60) grade = 'C';
  else grade = 'D';

  return {
    totalScore: validatorResult.score,
    breakdown: validatorResult.details,
    grade,
    suggestions: validatorResult.suggestions,
    issues: validatorResult.issues,
    conflicts: validatorResult.conflicts,
    status: validatorResult.status
  };
};

/**
 * 2. Compares two GeneratedPrompt objects and highlights differences.
 */
export const comparePrompts = (prompt1: GeneratedPrompt, prompt2: GeneratedPrompt): PromptComparison => {
  const styleDiff = diffStyleStrings(prompt1.style, prompt2.style);
  const tagsDiff = diffStyleStrings(prompt1.tags, prompt2.tags);

  return {
    title: { 
      diff: prompt1.title !== prompt2.title ? `"${prompt1.title}" -> "${prompt2.title}"` : 'Unchanged', 
      changed: prompt1.title !== prompt2.title 
    },
    tags: { 
      added: tagsDiff.added, 
      removed: tagsDiff.removed, 
      changed: tagsDiff.added.length > 0 || tagsDiff.removed.length > 0 
    },
    style: { 
      added: styleDiff.added, 
      removed: styleDiff.removed, 
      changed: styleDiff.added.length > 0 || styleDiff.removed.length > 0 
    },
    lyrics: { 
      diff: prompt1.lyrics !== prompt2.lyrics ? 'Lyrics modified' : 'Lyrics identical', 
      changed: prompt1.lyrics !== prompt2.lyrics 
    },
    analysis: { 
      diff: '', 
      changed: prompt1.analysis !== prompt2.analysis 
    },
  };
};

/**
 * 3. Converts an existing GeneratedPrompt into a reusable template structure.
 */
export const extractTemplate = (prompt: GeneratedPrompt): Partial<GenreTemplate> => {
  const parsedStyle = parseStylePrompt(prompt.style);
  const lyricsStats = analyzeLyrics(prompt.lyrics);

  const mainGenre = parsedStyle.genres.length > 0 
    ? GENRE_DATABASE.find(g => parsedStyle.genres[0].toLowerCase().includes(g.name.toLowerCase()))?.name || parsedStyle.genres[0]
    : 'Custom';

  let bpmRange: [number, number] = [90, 130];
  if (parsedStyle.bpm) {
      const bpmVal = parseInt(parsedStyle.bpm, 10);
      if (!isNaN(bpmVal)) {
          bpmRange = [Math.max(60, bpmVal - 10), Math.min(200, bpmVal + 10)];
      }
  }

  const commonStructure = Object.keys(lyricsStats.sectionCounts)
    .sort((a, b) => lyricsStats.sectionCounts[b] - lyricsStats.sectionCounts[a])
    .map(s => capitalize(s))
    .filter(s => ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro'].includes(s));

  const metaTags = Array.from(new Set([
    ...(prompt.tags.split(',').map(tag => tag.trim()).filter(Boolean)),
    ...lyricsStats.totalSections > 0 ? Object.keys(lyricsStats.sectionCounts).map(s => `[${capitalize(s)}]`) : []
  ]));

  return {
    id: crypto.randomUUID(),
    name: { en: prompt.title || 'Untitled Template', pl: prompt.title || 'Bez tytułu' },
    category: mainGenre,
    stylePrompt: prompt.style,
    bpmRange: bpmRange,
    recommendedKeys: parsedStyle.key ? [parsedStyle.key] : [],
    commonStructure: commonStructure.length > 0 ? commonStructure : ['Intro', 'Verse', 'Chorus', 'Outro'],
    metaTags: metaTags.slice(0, 5),
    tips: ['This is an extracted template. Review and refine its structure and tags.'],
    variations: [],
    exampleOutput: prompt.lyrics || ''
  };
};
