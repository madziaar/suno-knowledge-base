
import { GENRE_DATABASE } from '../data/genreDatabase';

export interface StyleComponents {
  genres: string[];
  subGenres: string[];
  moods: string[];
  vocals: string[]; // Kept for simple mode arrays
  vocalStyle?: string; // New for expert mode detailed string
  bpm?: string;
  key?: string;
  instruments: string[];
  atmosphere: string[]; // New: Texture/Vibe
  production: string[]; // New: Mixing/Tech
  influences: string[];
  era?: string;
}

/**
 * Searches the GENRE_DATABASE for a matching genre and returns its characteristics.
 * Used for deterministic enhancement of sparse prompts.
 */
export const enhanceFromDatabase = (genreName: string): Partial<StyleComponents> => {
  const normalizedInput = genreName.toLowerCase();
  
  // Find match in DB
  const genreDef = GENRE_DATABASE.find(g => 
    g.name.toLowerCase() === normalizedInput || 
    g.subGenres.some(sub => sub.toLowerCase() === normalizedInput)
  );

  if (!genreDef) return {};

  // Map DB fields to StyleComponents
  return {
    instruments: genreDef.instruments.slice(0, 3),
    vocals: genreDef.vocalsStyle.slice(0, 2),
    // Map characteristics to production/atmosphere heuristic
    production: genreDef.characteristics.filter(c => c.includes('production') || c.includes('mix') || c.includes('sound')),
    atmosphere: genreDef.characteristics.filter(c => !c.includes('production') && !c.includes('mix') && !c.includes('sound')),
    // If user input was a subgenre, ensure we have the main category too if needed, 
    // but usually specific subgenre is better.
    genres: [genreDef.name]
  };
};

/**
 * The V4.5 GOLDEN RULE BUILDER
 * Updated Order: Genre/Era -> Mood/Vocals -> Instrument Tones -> Rhythm/Tempo -> Key -> Production/Atmosphere
 * "Front-Loading" is critical for v4.5 to lock the vibe.
 */
export const assembleStylePrompt = (components: StyleComponents): string => {
  const parts: string[] = [];

  // 1. Genre & Era (The Anchor)
  // Logic: "1980s Synthpop" is stronger than "Synthpop, 1980s"
  const baseGenre = components.genres[0] || '';
  const era = components.era ? `${components.era}` : '';
  
  let genreBlock = '';
  if (era && baseGenre) genreBlock = `${era} ${baseGenre}`;
  else if (baseGenre) genreBlock = baseGenre;
  else if (era) genreBlock = `${era} Style`;

  if (genreBlock) parts.push(genreBlock);
  
  // Sub-Genres / Influences (Merged into Genre Slot)
  const subGenres = [...components.subGenres, ...components.influences];
  const uniqueSubGenres = subGenres.filter(s => s && s.toLowerCase() !== baseGenre.toLowerCase());
  if (uniqueSubGenres.length > 0) {
    parts.push(...uniqueSubGenres);
  }

  // 2. Mood & Vocals (The Emotional Core - Front-Loaded for v4.5)
  // v4.5 pays most attention to the first 30% of the prompt.
  if (components.moods.length > 0) {
    parts.push(...components.moods);
  }
  
  // Prioritize detailed vocalStyle string (Expert) over simple array
  if (components.vocalStyle) {
    parts.push(components.vocalStyle);
  } else if (components.vocals.length > 0) {
    parts.push(...components.vocals);
  }

  // 3. Instrument Tones (Arrangement)
  if (components.instruments.length > 0) {
    parts.push(...components.instruments);
  }

  // 4. Rhythm & Tempo
  if (components.bpm) {
    // Ensure "BPM" is present if it's just a number
    const bpmStr = components.bpm.toLowerCase().includes('bpm') ? components.bpm : `${components.bpm} BPM`;
    parts.push(bpmStr);
  }

  // 5. Key
  if (components.key) {
    parts.push(components.key);
  }

  // 6. Mixing & Atmosphere (The Polish - Moved to End)
  // These modify the sound but don't define the song's identity.
  if (components.production.length > 0) {
    parts.push(...components.production);
  }
  if (components.atmosphere && components.atmosphere.length > 0) {
    parts.push(...components.atmosphere);
  }

  // Final cleanup: 
  // - Deduplicate case-insensitive
  // - Trim whitespace
  // - Join with ", "
  const uniqueParts = parts.filter((item, index) => {
    if (!item) return false;
    const lowerItem = item.toLowerCase().trim();
    return parts.findIndex(p => p.toLowerCase().trim() === lowerItem) === index;
  });

  return uniqueParts.join(', ');
};

/**
 * Helper to parse a raw string into components (Heuristic Reverse-Engineering)
 * Useful for the "Import" feature.
 */
export const parseStyleToComponents = (rawString: string): StyleComponents => {
  const parts = rawString.split(',').map(s => s.trim()).filter(Boolean);
  
  const components: StyleComponents = {
    genres: [],
    subGenres: [],
    moods: [],
    vocals: [],
    instruments: [],
    atmosphere: [],
    production: [],
    influences: []
  };

  // Naive classification based on keywords
  parts.forEach(part => {
    const lower = part.toLowerCase();
    
    if (lower.includes('bpm')) {
        components.bpm = part;
    } else if (lower.includes('major') || lower.includes('minor') || lower.includes('key')) {
        components.key = part;
    } else if (lower.includes('vocal') || lower.includes('voice') || lower.includes('singer')) {
        components.vocals.push(part);
    } else if (lower.includes('guitar') || lower.includes('drum') || lower.includes('synth') || lower.includes('bass') || lower.includes('piano')) {
        components.instruments.push(part);
    } else if (lower.includes('mix') || lower.includes('production') || lower.includes('fi') || lower.includes('verb')) {
        components.production.push(part);
    } else {
        // Fallback: Assume early items are genres, later are moods/atmos
        if (components.genres.length === 0) components.genres.push(part);
        else components.moods.push(part);
    }
  });

  return components;
};
