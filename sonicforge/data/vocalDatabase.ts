
import { GENRE_DATABASE } from './genreDatabase';

// --- 1. GENDER & TYPE ---
export const GENDER_TYPES = [
  'Female', 'Male', 'Duet', 'Choir', 'Androgynous', 
  'Gender-Neutral', 'Boy', 'Girl', 'Youthful', 'Mature', 'Aged'
];

// --- 2. QUALITY & TEXTURE ---
export const VOCAL_QUALITIES = [
  'Airy', 'Breathy', 'Gritty', 'Raspy', 'Smooth', 'Silky', 'Rough', 
  'Gravelly', 'Clean', 'Distorted', 'Harsh', 'Ethereal', 'Angelic',
  'Soulful', 'Robotic', 'Nasal', 'Warm', 'Cold', 'Deep', 'Bright', 'Full'
];

// --- 3. DELIVERY STYLE ---
export const VOCAL_DELIVERIES = [
  'Whispered', 'Spoken Word', 'Rapping', 'Screaming', 'Growling', 
  'Shouting', 'Belting', 'Crooning', 'Falsetto', 'Operatic',
  'Guttural', 'Fried Scream', 'Melismatic', 'Chanting', 'Mumbled',
  'Staccato', 'Flow', 'Yelling', 'Talk-Singing'
];

// --- 4. REGIONAL & CULTURAL (New Phase 2) ---
export const VOCAL_REGIONS = [
  'Southern Flow', 'West Coast Accent', 'UK Accent', 'Atlanta Style', 
  'Memphis Style', 'East Coast Flow', 'K-Pop Style', 'Latin Style',
  'British Rock', 'NY Drill Flow', 'Caribbean Patois', 'French Accent'
];

// --- 5. EMOTIONAL TONE (New Phase 2) ---
export const VOCAL_EMOTIONS = [
  'Vulnerable', 'Confident', 'Melancholic', 'Joyful', 'Euphoric',
  'Haunting', 'Uplifting', 'Dark', 'Angry', 'Sentimental', 
  'Seductive', 'Painful', 'Bored', 'Manic', 'Sassy'
];

// --- 6. LAYERS & ARRANGEMENT (New Phase 2) ---
export const VOCAL_LAYERS = [
  'Lead Vocal', 'Background Vocals', 'Harmonies', 'Ad-libs', 
  'Call and Response', 'Gang Vocals', 'Doubled Vocals', 'Choir Backing'
];

// --- 7. PRESETS (Examples Database) ---
export interface VocalPreset {
  name: string;
  tags: string[];
  genres: string[];
}

export const VOCAL_PRESETS: VocalPreset[] = [
  { name: "Gospel Power", tags: ["Powerful", "Soulful", "Choir Backing", "Belting", "Uplifting"], genres: ["Gospel", "Soul"] },
  { name: "Ethereal Pop", tags: ["Female", "Ethereal", "Breathy", "High Reverb", "Dreamy"], genres: ["Pop", "Dream Pop"] },
  { name: "Trap Aggressive", tags: ["Male", "Aggressive", "Autotune", "Ad-libs", "Southern Flow"], genres: ["Trap", "Hip Hop"] },
  { name: "Metal Beast", tags: ["Male", "Guttural", "Screaming", "Fried Scream", "Aggressive"], genres: ["Metal"] },
  { name: "Vintage Crooner", tags: ["Male", "Deep", "Warm", "Smooth", "Retro"], genres: ["Jazz", "Oldies"] },
  { name: "Cyberpunk Diva", tags: ["Female", "Robotic", "Processed", "Cold", "Confident"], genres: ["Cyberpunk", "Techno"] },
  { name: "Indie Whisper", tags: ["Gender-Neutral", "Whispered", "Intimate", "Dry", "Vulnerable"], genres: ["Indie", "Folk"] },
  { name: "Drill MC", tags: ["Male", "Deep", "UK Accent", "Flow", "Dark"], genres: ["Drill", "Grime"] }
];

// --- HELPER: SUGGESTIONS ---
export const suggestVocalsForGenre = (genre: string): string[] => {
  if (!genre) return [];
  const normalizedInput = genre.toLowerCase();
  
  // Find match in Genre DB
  const genreDef = GENRE_DATABASE.find(g => 
    g.name.toLowerCase() === normalizedInput || 
    g.subGenres.some(sub => sub.toLowerCase() === normalizedInput)
  );

  if (genreDef) {
    return genreDef.vocalsStyle;
  }

  // Fallback heuristics
  if (normalizedInput.includes('metal')) return ['Screaming', 'Growling', 'Aggressive'];
  if (normalizedInput.includes('hip hop') || normalizedInput.includes('rap')) return ['Rapping', 'Flow', 'Ad-libs'];
  if (normalizedInput.includes('pop')) return ['Clean', 'Polished', 'Catchy'];
  
  return [];
};

// All descriptors flattened for parsing or other uses
export const VOCAL_DESCRIPTORS = [
  ...GENDER_TYPES,
  ...VOCAL_QUALITIES,
  ...VOCAL_DELIVERIES,
  ...VOCAL_REGIONS,
  ...VOCAL_EMOTIONS,
  ...VOCAL_LAYERS
];
