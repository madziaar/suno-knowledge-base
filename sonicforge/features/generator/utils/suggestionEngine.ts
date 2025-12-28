import { GENRE_DATABASE, MOOD_DESCRIPTORS, VOCAL_STYLES } from '../data/genreDatabase';
import { INSTRUMENTS_SUNO, MOOD_INSTRUMENT_MAP, GENRE_INSTRUMENT_MAP } from '../data/autocompleteData';
import { sunoMetaTags } from '../data/sunoMetaTags';

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
  // Check against Genre Database first
  GENRE_DATABASE.forEach(def => {
    if (activeGenres.includes(def.name.toLowerCase()) || def.subGenres.some(s => activeGenres.includes(s.toLowerCase()))) {
      def.instruments.forEach(inst => priorities.add(inst));
    }
  });

  // Check against Genre Map (Fallback/Extras)
  Object.keys(GENRE_INSTRUMENT_MAP).forEach(key => {
    if (activeGenres.some(g => g.includes(key.toLowerCase()))) {
      // Fix: GENRE_INSTRUMENT_MAP[key] is an object { primary: string[], secondary: string[] }
      const entry = GENRE_INSTRUMENT_MAP[key];
      entry.primary.forEach(inst => priorities.add(inst));
      entry.secondary.forEach(inst => priorities.add(inst));
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
  // Priority items first, then the rest of the standard list
  const priorityList = Array.from(priorities);
  const otherInstruments = INSTRUMENTS_SUNO.filter(i => !priorities.has(i));

  return [...priorityList, ...otherInstruments];
};

/**
 * fuzzy search for genres
 */
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
 */
export const validateCombination = (genre: string, mood: string, vocals: string): CompatibilityCheck => {
  const warnings: string[] = [];
  const g = genre.toLowerCase();
  const m = mood.toLowerCase();
  const v = vocals.toLowerCase();

  // Vocals vs Genre Conflicts
  if ((g.includes('instrumental') || g.includes('ambient')) && v.length > 0 && !v.includes('instrumental')) {
    warnings.push(`Note: '${genre}' is usually instrumental, but vocal style '${vocals}' is specified.`);
  }
  if (g.includes('acoustic') && (v.includes('autotune') || v.includes('robotic'))) {
    warnings.push(`Clash: 'Autotune' vocals in an 'Acoustic' genre is unusual.`);
  }
  if (g.includes('classical') && (v.includes('rap') || v.includes('scream'))) {
    warnings.push(`Unusual: '${vocals}' in 'Classical' music.`);
  }

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

  // 0. Instrumental Mode Suggestions (ENHANCED)
  if (mode === 'instrumental') {
      const genreText = genres.join(' ').toLowerCase();
      
      // Jazz specific
      if (genreText.includes('jazz') || genreText.includes('fusion') || genreText.includes('blues')) {
          if (!combinedContext.includes('[improv]')) suggestions.push({ type: 'meta', value: '[Improv]', reason: 'Key for Jazz' });
          if (!combinedContext.includes('[trading 4s]')) suggestions.push({ type: 'meta', value: '[Trading 4s]', reason: 'Solo exchange' });
      }
      
      // Rock/Metal specific
      if (genreText.includes('rock') || genreText.includes('metal')) {
          if (!combinedContext.includes('[riff]')) suggestions.push({ type: 'meta', value: '[Main Riff]', reason: 'Central guitar motif' });
          if (!combinedContext.includes('[solo]')) suggestions.push({ type: 'meta', value: '[Guitar Solo]', reason: 'Genre staple' });
      }
      
      // Electronic specific
      if (genreText.includes('electronic') || genreText.includes('edm') || genreText.includes('trap') || genreText.includes('house')) {
          if (!combinedContext.includes('[drop]')) suggestions.push({ type: 'meta', value: '[Drop]', reason: 'Main climax' });
          if (!combinedContext.includes('[bassline]')) suggestions.push({ type: 'meta', value: '[Bassline]', reason: 'Groove focus' });
      }
      
      // Cinematic/Ambient specific
      if (genreText.includes('cinematic') || genreText.includes('ambient') || genreText.includes('score')) {
           if (!combinedContext.includes('[crescendo]')) suggestions.push({ type: 'meta', value: '[Crescendo]', reason: 'Dynamic build' });
           if (!combinedContext.includes('[silence]')) suggestions.push({ type: 'meta', value: '[Silence]', reason: 'Dramatic pause' });
      }

      // General Instrumental
      if (!combinedContext.includes('[theme]')) {
          suggestions.push({ type: 'meta', value: '[Theme A]', reason: 'Structure motif' });
      }
      
      return suggestions.slice(0, 4);
  }

  // 1. Genre-Based Suggestions
  genres.forEach(genre => {
    const g = genre.toLowerCase();
    
    if (g.includes('trap') && !combinedContext.includes('808')) {
      suggestions.push({ type: 'instrument', value: '808 Bass', reason: 'Essential for Trap' });
    }
    if (g.includes('hip hop') && !combinedContext.includes('phonk drum')) {
      suggestions.push({ type: 'instrument', value: 'Phonk Drum', reason: 'Fixes drum sound in v4.5' });
    }
    if (g.includes('synthwave') && !combinedContext.includes('analog')) {
      suggestions.push({ type: 'instrument', value: 'Analog Synth', reason: 'Adds warmth to Synthwave' });
    }
    if (g.includes('metal') && !combinedContext.includes('distorted')) {
      suggestions.push({ type: 'general', value: 'Distorted Guitars', reason: 'Key for Metal sound' });
    }
    if (g.includes('lo-fi') && !combinedContext.includes('vinyl')) {
      suggestions.push({ type: 'general', value: 'Vinyl Crackle', reason: 'Adds Lo-fi texture' });
    }
  });

  // 2. Missing Elements
  if (genres.length > 0 && !mood) {
    // Suggest mood based on genre
    const genreDef = GENRE_DATABASE.find(def => genres.some(g => g.toLowerCase() === def.name.toLowerCase()));
    if (genreDef) {
       // Heuristic: map characteristics to mood
       suggestions.push({ type: 'mood', value: 'Atmospheric', reason: 'Enhances vibe' });
    }
  }

  // 3. Meta Tag Suggestions based on Lyric Content
  if (currentInput.includes('[Verse]') && !currentInput.includes('[Chorus]')) {
      suggestions.push({ type: 'meta', value: '[Chorus]', reason: 'Song structure usually needs a Chorus' });
  }

  return suggestions.slice(0, 4); // Limit to 4 suggestions
};

/**
 * Suggests meta tags based on the last typed line or context.
 */
export const suggestMetaTags = (partialLine: string): string[] => {
  const lower = partialLine.toLowerCase();
  
  if (lower.startsWith('[')) {
    // User is typing a tag
    const search = lower.replace('[', '');
    return sunoMetaTags
      .filter(t => t.name.startsWith(search))
      .map(t => `[${t.name}]`)
      .slice(0, 5);
  }
  
  return [];
};