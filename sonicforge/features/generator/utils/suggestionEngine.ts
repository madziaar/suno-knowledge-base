
import { GENRE_DATABASE, MOOD_DESCRIPTORS, VOCAL_STYLES } from '../data/genreDatabase';
import { INSTRUMENTS_SUNO, MOOD_INSTRUMENT_MAP, GENRE_INSTRUMENT_MAP } from '../data/autocompleteData';
import { sunoMetaTags } from '../data/sunoMetaTags';
import { CONFLICT_PAIRS } from '../data/descriptorBank';

export interface Suggestion {
  type: 'instrument' | 'mood' | 'vocal' | 'meta' | 'general';
  value: string;
  reason: string;
}

export interface CompatibilityCheck {
  isCompatible: boolean;
  warnings: string[];
}

/**
 * Returns a sorted list of instruments prioritized by the active genre and mood.
 */
export const suggestInstruments = (genres: string[], mood?: string): string[] => {
  const priorities = new Set<string>();
  const activeGenres = genres.map(g => g.toLowerCase().trim());
  const lowerMood = mood?.toLowerCase().trim();

  // 1. Genre Specifics (High Priority)
  GENRE_DATABASE.forEach(def => {
    if (activeGenres.includes(def.name.toLowerCase()) || def.subGenres.some(s => activeGenres.includes(s.toLowerCase()))) {
      def.instruments.forEach(inst => priorities.add(inst));
    }
  });

  Object.keys(GENRE_INSTRUMENT_MAP).forEach(key => {
    if (activeGenres.some(g => g.includes(key.toLowerCase()))) {
      const { primary, secondary } = GENRE_INSTRUMENT_MAP[key];
      primary.forEach(inst => priorities.add(inst));
      secondary.forEach(inst => priorities.add(inst));
    }
  });

  // 2. Mood Specifics (Medium Priority)
  if (lowerMood) {
    Object.keys(MOOD_INSTRUMENT_MAP).forEach(key => {
      if (lowerMood.includes(key.toLowerCase())) {
        MOOD_INSTRUMENT_MAP[key].forEach(inst => priorities.add(inst));
      }
    });
  }

  // 3. Construct Final List
  const priorityList = Array.from(priorities);
  const otherInstruments = INSTRUMENTS_SUNO.filter(i => !priorities.has(i));

  return [...priorityList, ...otherInstruments];
};

export const suggestGenres = (query: string): string[] => {
  if (!query) return [];
  const lower = query.toLowerCase();
  
  const matches = new Set<string>();
  
  GENRE_DATABASE.forEach(def => {
    if (def.name.toLowerCase().includes(lower)) matches.add(def.name);
    def.subGenres.forEach(sub => {
      if (sub.toLowerCase().includes(lower)) matches.add(sub);
    });
  });

  return Array.from(matches).sort();
};

/**
 * Validates the combination of Genre, Mood, and Vocals for semantic conflicts.
 * Now uses shared CONFLICT_PAIRS.
 */
export const validateCombination = (genre: string, mood: string, vocals: string): CompatibilityCheck => {
  const warnings: string[] = [];
  const combinedContext = `${genre} ${mood} ${vocals}`.toLowerCase();

  // Vocals vs Genre Conflicts (Hardcoded Criticals)
  const g = genre.toLowerCase();
  const v = vocals.toLowerCase();
  if ((g.includes('instrumental') || g.includes('ambient')) && v.length > 0 && !v.includes('instrumental')) {
    warnings.push(`Note: '${genre}' is usually instrumental, but vocal style '${vocals}' is specified.`);
  }
  
  // Shared Semantic Conflicts
  CONFLICT_PAIRS.forEach(pair => {
      const hasA = pair.a.find(k => combinedContext.includes(k));
      const hasB = pair.b.find(k => combinedContext.includes(k));
      
      if (hasA && hasB) {
          warnings.push(`Conflict: '${hasA}' clashes with '${hasB}' (${pair.message}).`);
      }
  });

  return {
    isCompatible: warnings.length === 0,
    warnings
  };
};

/**
 * Analyzes the current prompt state and returns smart suggestions.
 */
export const getSmartSuggestions = (
  genres: string[],
  mood: string,
  instruments: string,
  currentInput: string,
  mode?: 'custom' | 'general' | 'instrumental' | 'easy'
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const combinedContext = (genres.join(' ') + ' ' + mood + ' ' + instruments + ' ' + currentInput).toLowerCase();

  // 0. Instrumental Mode Suggestions
  if (mode === 'instrumental') {
      const genreText = genres.join(' ').toLowerCase();
      
      if (genreText.includes('jazz') && !combinedContext.includes('[improv]')) 
          suggestions.push({ type: 'meta', value: '[Improv]', reason: 'Key for Jazz' });
      
      if ((genreText.includes('rock') || genreText.includes('metal')) && !combinedContext.includes('[solo]')) 
          suggestions.push({ type: 'meta', value: '[Guitar Solo]', reason: 'Genre staple' });
      
      if ((genreText.includes('electronic') || genreText.includes('edm')) && !combinedContext.includes('[drop]')) 
          suggestions.push({ type: 'meta', value: '[Drop]', reason: 'Main climax' });

      if (!combinedContext.includes('[theme]')) {
          suggestions.push({ type: 'meta', value: '[Theme A]', reason: 'Structure motif' });
      }
      
      return suggestions.slice(0, 4);
  }

  // 1. Genre-Based Suggestions
  genres.forEach(genre => {
    const g = genre.toLowerCase();
    
    if (g.includes('trap') && !combinedContext.includes('phonk')) {
      suggestions.push({ type: 'instrument', value: 'Phonk Drum', reason: 'Modern Trap requirement' });
    }
    if (g.includes('metal') && !combinedContext.includes('distorted')) {
      suggestions.push({ type: 'general', value: 'Distorted Guitars', reason: 'Key for Metal sound' });
    }
  });

  // 2. Missing Elements
  if (genres.length > 0 && !mood) {
    suggestions.push({ type: 'mood', value: 'Atmospheric', reason: 'Enhances vibe' });
  }

  // 3. Meta Tag Suggestions
  if (currentInput.includes('[Verse]') && !currentInput.includes('[Chorus]')) {
      suggestions.push({ type: 'meta', value: '[Chorus]', reason: 'Standard Structure' });
  }

  return suggestions.slice(0, 4);
};

export const suggestMetaTags = (partialLine: string): string[] => {
  const lower = partialLine.toLowerCase();
  
  if (lower.startsWith('[')) {
    const search = lower.replace('[', '');
    return sunoMetaTags
      .filter(t => t.name.startsWith(search))
      .map(t => `[${t.name}]`)
      .slice(0, 5);
  }
  
  return [];
};
