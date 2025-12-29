
import { GenreTemplate, SongConcept } from '../../../types';
import { GENRE_TEMPLATES } from '../data/genreTemplates';
import { parseStylePrompt } from './promptParser';

/**
 * Retrieves a full template by ID.
 */
export const getGenreTemplate = (id: string): GenreTemplate | undefined => {
  return GENRE_TEMPLATES.find(t => t.id === id);
};

/**
 * Returns all templates, optionally filtered by category.
 */
export const getAllTemplates = (category?: string): GenreTemplate[] => {
  if (category) {
    return GENRE_TEMPLATES.filter(t => t.category === category);
  }
  return GENRE_TEMPLATES;
};

/**
 * Customizes a template with user inputs to create a partial SongConcept.
 * Ensures strict template style string is preserved while allowing intent injection.
 */
export const customizeTemplate = (
  template: GenreTemplate, 
  customizations: { mood?: string; topic?: string; additionalTags?: string[] }
): Partial<SongConcept> => {
  
  // The template's style prompt is the "Golden" string. We don't want to mess it up too much.
  // We will map it to the 'intent' field of SongConcept, but prepended with the user's topic if provided.
  
  let baseStyle = template.stylePrompt;
  
  // If user provides a mood that isn't in the template, we might want to inject it,
  // but usually the template style is rigid. We'll set the 'mood' field separately.
  
  // Construct the final 'intent' which drives the generation
  let finalIntent = `Style: ${baseStyle}`;
  
  if (customizations.topic) {
      finalIntent = `Topic: ${customizations.topic}. ${finalIntent}`;
  }

  // Append tags if any (rarely used directly here, usually via UI)
  if (customizations.additionalTags && customizations.additionalTags.length > 0) {
    finalIntent += `, ${customizations.additionalTags.join(', ')}`;
  }

  // Extract fallback mood from stylePrompt since GenreTemplate doesn't store it explicitly
  const parsedStyle = parseStylePrompt(template.stylePrompt);
  const fallbackMood = parsedStyle.moods.length > 0 ? parsedStyle.moods[0] : '';

  return {
    intent: finalIntent, // This ensures the generator sees the full technical spec
    mood: customizations.mood || fallbackMood, 
    instruments: '', // Template style string handles instruments usually
    artistReference: template.name.en // Use template name as reference
  };
};

/**
 * Blends two genre templates intelligently.
 * Merges keywords, averages BPM, and combines structures.
 */
export const blendTemplates = (t1: GenreTemplate, t2: GenreTemplate): string => {
  // 1. Blend Names
  // const name = `${t1.name.en} x ${t2.name.en}`;

  // 2. Average BPM
  const avgBpmMin = Math.floor((t1.bpmRange[0] + t2.bpmRange[0]) / 2);
  const avgBpmMax = Math.floor((t1.bpmRange[1] + t2.bpmRange[1]) / 2);
  const bpmString = `${avgBpmMin}-${avgBpmMax} BPM`;

  // 3. Combine Keywords (Unique)
  const style1Parts = t1.stylePrompt.split(',').map(s => s.trim());
  const style2Parts = t2.stylePrompt.split(',').map(s => s.trim());
  
  // Create a priority set. We want Genre/Subgenre from both, but filter conflicting BPMs/Keys
  const combinedSet = new Set([...style1Parts, ...style2Parts]);
  
  // Remove conflicting BPMs from the set to replace with averaged one
  const cleanedStyle = Array.from(combinedSet).filter(s => !s.toLowerCase().includes('bpm'));
  
  // 4. Construct final string
  // Put Genres first (first items from both original lists)
  const genre1 = style1Parts[0];
  const genre2 = style2Parts[0];
  const otherTags = cleanedStyle.filter(s => s !== genre1 && s !== genre2);
  
  return `${genre1}, ${genre2}, ${bpmString}, ${otherTags.join(', ')}`;
};
