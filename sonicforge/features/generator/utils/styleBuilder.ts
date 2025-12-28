
import { GENRE_DATABASE } from '../data/genreDatabase';

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

export const enhanceFromDatabase = (genreName: string): Partial<StyleComponents> => {
  const normalizedInput = genreName.toLowerCase();
  const genreDef = GENRE_DATABASE.find(g => 
    g.name.toLowerCase() === normalizedInput || 
    g.subGenres.some(sub => sub.toLowerCase() === normalizedInput)
  );

  if (!genreDef) return {};

  return {
    instruments: genreDef.instruments.slice(0, 3),
    vocals: genreDef.vocalsStyle.slice(0, 2),
    production: genreDef.characteristics.filter(c => c.includes('production') || c.includes('mix') || c.includes('sound')),
    atmosphere: genreDef.characteristics.filter(c => !c.includes('production') && !c.includes('mix') && !c.includes('sound')),
    genres: [genreDef.name]
  };
};

/**
 * THE OBSIDIAN HIERARCHICAL BLUEPRINT (V4.5)
 * Strict Sequence of Weight:
 * 1. GENRE ANCHOR (User Genre + Era)
 * 2. VOCAL LOCK (Gender + Timbre - Mandatory Position)
 * 3. ATMOSPHERIC CORE (Moods + Textures)
 * 4. HARDWARE/GEAR (Instruments + Specific Models)
 * 5. MASTER CHAIN (Mixing + Production Specs)
 */
export const assembleStylePrompt = (components: StyleComponents): string => {
  const layers: string[] = [];

  // LAYER 1: GENRE ANCHOR
  const baseGenre = components.genres[0] || '';
  const era = components.era ? `${components.era} Style` : '';
  const anchor = [era, baseGenre, ...components.subGenres].filter(Boolean).join(' ');
  if (anchor) layers.push(anchor);

  // LAYER 2: VOCAL LOCK (The Gender Guard)
  // This must be here to prevent the 'Male Hallucination' in V4.5
  const vocals = components.vocalStyle || components.vocals.join(', ');
  if (vocals) layers.push(vocals);

  // LAYER 3: ATMOSPHERIC CORE
  const moods = components.moods.join(', ');
  const atmos = components.atmosphere.join(', ');
  if (moods || atmos) layers.push([moods, atmos].filter(Boolean).join(', '));

  // LAYER 4: HARDWARE & GEAR
  const bpmStr = components.bpm ? (components.bpm.toLowerCase().includes('bpm') ? components.bpm : `${components.bpm} BPM`) : '';
  const keyStr = components.key || '';
  const instruments = components.instruments.join(', ');
  if (bpmStr || keyStr || instruments) {
      layers.push([bpmStr, keyStr, instruments].filter(Boolean).join(', '));
  }

  // LAYER 5: MASTER CHAIN
  const production = [...components.production, ...components.influences].join(', ');
  if (production) layers.push(production);

  // Flatten and filter
  const finalString = layers.filter(Boolean).join(', ');
  
  // Deduplicate words while keeping order (simplified)
  const words = finalString.split(',').map(s => s.trim()).filter(Boolean);
  return Array.from(new Set(words)).join(', ');
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
    else if (lower.includes('major') || lower.includes('minor') || lower.includes('key')) components.key = part;
    else if (lower.includes('vocal') || lower.includes('voice') || lower.includes('singer') || lower.includes('scream')) components.vocals.push(part);
    else if (lower.includes('guitar') || lower.includes('drum') || lower.includes('synth') || lower.includes('bass') || lower.includes('flamenco')) components.instruments.push(part);
    else if (lower.includes('mix') || lower.includes('production') || lower.includes('fi') || lower.includes('tape') || lower.includes('wide')) components.production.push(part);
    else {
        if (components.genres.length === 0) components.genres.push(part);
        else components.moods.push(part);
    }
  });

  return components;
};
