
import { GENRE_DATABASE } from '../data/genreDatabase';
import { sunoMetaTags } from '../data/sunoMetaTags';

export interface StyleComponents {
  genres: string[];
  subGenres: string[];
  moods: string[];
  vocals: string[]; 
  vocalStyle?: string; 
  bpm?: string;
  key?: string;
  instruments: string[];
  atmosphere: string[]; 
  production: string[]; 
  influences: string[];
  era?: string;
}

export interface BuildStyleConfig {
  genre: string | string[];
  mood?: string | string[];
  vocals?: string | string[];
  tempo?: number | string;
  key?: string;
  instruments?: string[];
  production?: string[];
  atmosphere?: string[];
  enhance?: boolean;
}

/**
 * Retrieves genre-specific defaults from the database.
 */
export const enhanceFromDatabase = (genreName: string): Partial<StyleComponents> => {
  const normalizedInput = genreName.toLowerCase();
  const genreDef = GENRE_DATABASE.find(g => 
    g.name.toLowerCase() === normalizedInput || 
    g.subGenres.some(sub => sub.toLowerCase() === normalizedInput)
  );

  if (!genreDef) return {};

  return {
    instruments: genreDef.instruments.slice(0, 4), // Grab top 4 signature instruments
    vocals: genreDef.vocalsStyle.slice(0, 2),      // Grab top 2 vocal styles
    production: genreDef.characteristics.filter(c => c.includes('production') || c.includes('mix') || c.includes('sound') || c.includes('fi')),
    atmosphere: genreDef.characteristics.filter(c => !c.includes('production') && !c.includes('mix') && !c.includes('sound') && !c.includes('fi')),
    genres: [genreDef.name]
  };
};

/**
 * CANONICAL V4.5 PROMPT FORMULA
 * Sequence: GENRE, SUBGENRE, MOOD, BPM, KEY, VOCAL STYLE, INSTRUMENTS, ATMOSPHERE, PRODUCTION QUALITY
 */
export const assembleStylePrompt = (components: StyleComponents): string => {
  const parts: string[] = [];

  // 1. GENRE & ERA
  const eraPrefix = components.era ? `${components.era} Style` : '';
  const baseGenre = components.genres[0] || '';
  const genrePart = [eraPrefix, baseGenre].filter(Boolean).join(' ');
  if (genrePart) parts.push(genrePart);

  // 2. SUBGENRE / SECONDARY GENRES
  if (components.genres.length > 1) {
     parts.push(...components.genres.slice(1).map(g => `${g} influence`));
  }
  if (components.subGenres.length > 0) {
    parts.push(components.subGenres.join(', '));
  }

  // 3. MOOD
  if (components.moods.length > 0) {
    parts.push(components.moods.join(', '));
  }

  // 4. BPM
  if (components.bpm) {
    let bpmVal = components.bpm.toString();
    if (!bpmVal.toLowerCase().includes('bpm')) {
        bpmVal += ' BPM';
    }
    parts.push(bpmVal);
  }

  // 5. KEY
  if (components.key) {
    parts.push(components.key);
  }

  // 6. VOCAL STYLE (Mandatory Position for Hallucination Guard)
  const vocals = components.vocalStyle || components.vocals.join(', ');
  if (vocals) parts.push(vocals);

  // 7. INSTRUMENTS
  if (components.instruments.length > 0) {
    parts.push(components.instruments.join(', '));
  }

  // 8. ATMOSPHERE
  if (components.atmosphere.length > 0) {
    parts.push(components.atmosphere.join(', '));
  }

  // 9. PRODUCTION QUALITY
  const production = [...components.production, ...components.influences].join(', ');
  if (production) parts.push(production);

  // Flatten, deduplicate, and clean
  const finalString = parts.filter(Boolean).join(', ');
  
  // Basic cleanup to remove duplicate words if they appear sequentially
  return finalString.replace(/\b(\w+), \1\b/g, '$1');
};

/**
 * THE MAIN BUILDER FUNCTION
 * Orchestrates the creation of an optimized style prompt.
 */
export const buildStylePrompt = (config: BuildStyleConfig): string => {
    // 1. Normalize Inputs
    const normalize = (val: string | string[] | undefined): string[] => {
        if (!val) return [];
        return Array.isArray(val) ? val : val.split(',').map(s => s.trim());
    };

    const genres = normalize(config.genre);
    const primaryGenre = genres[0] || '';

    // 2. Initialize Components
    let components: StyleComponents = {
        genres: genres,
        subGenres: [],
        moods: normalize(config.mood),
        vocals: normalize(config.vocals),
        bpm: config.tempo ? config.tempo.toString() : undefined,
        key: config.key,
        instruments: normalize(config.instruments),
        atmosphere: normalize(config.atmosphere),
        production: normalize(config.production),
        influences: []
    };

    // 3. Apply Enhancement (if requested)
    if (config.enhance && primaryGenre) {
        const enhancements = enhanceFromDatabase(primaryGenre);
        
        // Merge without duplicating
        const merge = (target: string[], source?: string[]) => {
            if (!source) return;
            source.forEach(s => {
                if (!target.includes(s)) target.push(s);
            });
        };

        merge(components.instruments, enhancements.instruments);
        merge(components.vocals, enhancements.vocals);
        merge(components.production, enhancements.production);
        merge(components.atmosphere, enhancements.atmosphere);
    }

    // 4. Assemble
    return assembleStylePrompt(components);
};

export const parseStyleToComponents = (rawString: string): StyleComponents => {
  const parts = rawString.split(',').map(s => s.trim()).filter(Boolean);
  const components: StyleComponents = {
    genres: [], subGenres: [], moods: [], vocals: [], instruments: [],
    atmosphere: [], production: [], influences: []
  };

  parts.forEach(part => {
    const lower = part.toLowerCase();
    if (lower.includes('bpm')) components.bpm = part;
    else if (lower.match(/\b[a-g](?:#|b)?\s*(?:major|minor)\b/)) components.key = part;
    else if (lower.includes('vocal') || lower.includes('voice') || lower.includes('singer') || lower.includes('scream')) components.vocals.push(part);
    else if (lower.includes('guitar') || lower.includes('drum') || lower.includes('synth') || lower.includes('bass') || lower.includes('flamenco')) components.instruments.push(part);
    else if (lower.includes('mix') || lower.includes('production') || lower.includes('fi') || lower.includes('tape') || lower.includes('wide')) components.production.push(part);
    else {
        // Simple heuristic: First item is usually genre
        if (components.genres.length === 0) components.genres.push(part);
        else components.moods.push(part);
    }
  });

  return components;
};
