
import { GENRE_DATABASE, MOOD_DESCRIPTORS } from '../data/genreDatabase';
import { INSTRUMENTS_SUNO } from '../data/autocompleteData';
import { sunoMetaTags } from '../data/sunoMetaTags';
// FIX: Imported the capitalize utility to resolve the "Cannot find name 'capitalize'" error.
import { capitalize } from '../../../lib/utils';

export interface ParsedStyle {
  bpm?: string;
  key?: string;
  genres: string[];
  moods: string[];
  instruments: string[];
  vocals: string[];
  production: string[];
  remaining: string[]; // Uncategorized terms
}

export interface LyricStats {
  totalSections: number;
  sectionCounts: Record<string, number>;
  estimatedDuration: string; // "3:30"
  hasEnding: boolean;
}

/**
 * Deconstructs a style string into components.
 * Uses heuristics and database lookups.
 */
export const parseStylePrompt = (styleString: string): ParsedStyle => {
  const parts = styleString.split(',').map(s => s.trim()).filter(Boolean);
  const result: ParsedStyle = {
    genres: [],
    moods: [],
    instruments: [],
    vocals: [],
    production: [],
    remaining: []
  };

  // Helper to check against lists
  const findMatch = (text: string, list: string[]): string | undefined => {
    return list.find(item => text.toLowerCase().includes(item.toLowerCase()));
  };

  parts.forEach(part => {
    let matched = false;
    const lower = part.toLowerCase();

    // 1. BPM
    const bpmMatch = lower.match(/(\d+)\s*bpm/);
    if (bpmMatch) {
      result.bpm = bpmMatch[1];
      matched = true;
    }

    // 2. Key
    const keyMatch = lower.match(/\b([a-g](?:#|b)?)\s*(major|minor|maj|min|dorian|phrygian|lydian|mixolydian|aeolian|locrian)\b/);
    if (keyMatch && !matched) {
      result.key = part; // Keep original formatting for key
      matched = true;
    }

    // 3. Vocals (Check meta tags and known vocal styles)
    if (!matched) {
      const vocalTag = sunoMetaTags.find(t => t.category === 'vocals' && lower.includes(t.name));
      if (vocalTag || lower.includes('vocal') || lower.includes('voice') || lower.includes('singer')) {
        result.vocals.push(part);
        matched = true;
      }
    }

    // 4. Genres (Check Genre DB)
    if (!matched) {
      const genre = GENRE_DATABASE.find(g => 
        lower.includes(g.name.toLowerCase()) || 
        g.subGenres.some(sub => lower.includes(sub.toLowerCase()))
      );
      if (genre) {
        // If exact match or close enough
        result.genres.push(part);
        matched = true;
      }
    }

    // 5. Instruments
    if (!matched) {
      const allInstruments = [...INSTRUMENTS_SUNO];
      if (findMatch(part, allInstruments) || lower.includes('guitar') || lower.includes('drum') || lower.includes('bass') || lower.includes('synth') || lower.includes('piano')) {
        result.instruments.push(part);
        matched = true;
      }
    }

    // 6. Moods
    if (!matched) {
      const allMoods: string[] = Object.values(MOOD_DESCRIPTORS).flat();
      if (findMatch(part, allMoods)) {
        result.moods.push(part);
        matched = true;
      }
    }

    // 7. Production (Meta tags check)
    if (!matched) {
      const prodTag = sunoMetaTags.find(t => (t.category === 'production' || t.category === 'technique') && lower.includes(t.name));
      if (prodTag) {
        result.production.push(part);
        matched = true;
      }
    }

    // 8. Remaining
    if (!matched) {
      result.remaining.push(part);
    }
  });

  return result;
};

/**
 * Analyzes lyrics to estimate structure and duration.
 */
export const analyzeLyrics = (lyrics: string): LyricStats => {
  const sectionsMatch: string[] = lyrics.match(/\[(.*?)\]/g) ?? [];
  const sectionCounts: Record<string, number> = {};
  
  sectionsMatch.forEach(tag => {
    const clean = tag.replace(/[\[\]]/g, '').split('|')[0].trim().toLowerCase();
    // Normalize basic types and capitalize for consistency with common structure names
    let type = clean;
    if (type.includes('verse')) type = 'Verse';
    else if (type.includes('chorus')) type = 'Chorus';
    else if (type.includes('bridge')) type = 'Bridge';
    else if (type.includes('intro')) type = 'Intro';
    else if (type.includes('outro')) type = 'Outro';
    else if (type.includes('solo')) type = 'Solo';
    else if (type.includes('instrumental')) type = 'Instrumental';
    else type = capitalize(type); // Capitalize other detected tags

    sectionCounts[type] = (sectionCounts[type] || 0) + 1;
  });

  // Rough estimation: 
  // Verse ~30s, Chorus ~25s, Bridge ~20s, Intro/Outro/Solo/Instrumental ~15-20s
  let totalSeconds = 0;
  totalSeconds += (sectionCounts['Verse'] || 0) * 30;
  totalSeconds += (sectionCounts['Chorus'] || 0) * 25;
  totalSeconds += (sectionCounts['Bridge'] || 0) * 20;
  totalSeconds += ((sectionCounts['Intro'] || 0) + (sectionCounts['Outro'] || 0) + (sectionCounts['Solo'] || 0) + (sectionCounts['Instrumental'] || 0)) * 18;
  
  // Add generic block count if structure tags are sparse but text is long
  const lineCount = lyrics.split('\n').filter(l => l.trim().length > 0).length;
  // If low section count but high lines, estimate based on lines (approx 3s per line)
  if (sectionsMatch.length < 2 && lineCount > 10) { // Only apply if few explicit sections but many lines
      totalSeconds = Math.max(totalSeconds, lineCount * 3.5);
  }

  // Cap at 8 minutes (480 seconds)
  totalSeconds = Math.min(totalSeconds, 480);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return {
    totalSections: sectionsMatch.length,
    sectionCounts,
    estimatedDuration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    hasEnding: lyrics.toLowerCase().includes('[end]') || lyrics.toLowerCase().includes('fade out') || lyrics.toLowerCase().includes('[outro]')
  };
};
