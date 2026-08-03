
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

// --- 4. REGIONAL & CULTURAL (v4.5 Expanded) ---
export const VOCAL_REGIONS = [
  'Southern Flow', 'West Coast Accent', 'UK Accent', 'Atlanta Style', 
  'Memphis Style', 'East Coast Flow', 'K-Pop Style', 'Latin Style',
  'British Rock', 'NY Drill Flow', 'Caribbean Patois', 'French Accent',
  'Slavic Influence', 'Nordic Tone'
];

// --- 5. EMOTIONAL TONE (v4.5 Enhanced) ---
export const VOCAL_EMOTIONS = [
  'Vulnerable', 'Confident', 'Melancholic', 'Joyful', 'Euphoric',
  'Haunting', 'Uplifting', 'Dark', 'Angry', 'Sentimental', 
  'Seductive', 'Painful', 'Bored', 'Manic', 'Sassy',
  'Intimate', 'Desperate', 'Hopeful', 'Nostalgic', 'Bittersweet'
];

// --- 6. LAYERS & ARRANGEMENT ---
export const VOCAL_LAYERS = [
  'Lead Vocal', 'Background Vocals', 'Harmonies', 'Ad-libs', 
  'Call and Response', 'Gang Vocals', 'Doubled Vocals', 'Choir Backing'
];

// --- 7. TECHNIQUES (v4.5 New) ---
export const VOCAL_TECHNIQUES = [
  'Vocal Fry', 'Microtonal', 'Vibrato', 'Glissando', 'Tremolo',
  'Yodeling', 'Beatbox', 'Scat', 'Throat Singing'
];

// --- 8. PRESETS (Examples Database) ---
export interface VocalPreset {
  name: { en: string; pl: string };
  tags: string[];
  genres: string[];
}

export const VOCAL_PRESETS: VocalPreset[] = [
  { name: { en: "Gospel Power", pl: "Potęga Gospel" }, tags: ["Powerful", "Soulful", "Choir Backing", "Belting", "Uplifting"], genres: ["Gospel", "Soul"] },
  { name: { en: "Ethereal Pop", pl: "Eteryczny Pop" }, tags: ["Female", "Ethereal", "Breathy", "High Reverb", "Dreamy"], genres: ["Pop", "Dream Pop"] },
  { name: { en: "Trap Aggressive", pl: "Agresywny Trap" }, tags: ["Male", "Aggressive", "Autotune", "Ad-libs", "Southern Flow"], genres: ["Trap", "Hip Hop"] },
  { name: { en: "Metal Beast", pl: "Metalowa Bestia" }, tags: ["Male", "Guttural", "Screaming", "Fried Scream", "Aggressive"], genres: ["Metal"] },
  { name: { en: "Vintage Crooner", pl: "Klasyczny Crooner" }, tags: ["Male", "Deep", "Warm", "Smooth", "Retro"], genres: ["Jazz", "Oldies"] },
  { name: { en: "Cyberpunk Diva", pl: "Cyberpunkowa Diva" }, tags: ["Female", "Robotic", "Processed", "Cold", "Confident"], genres: ["Cyberpunk", "Techno"] },
  { name: { en: "Indie Whisper", pl: "Indie Szept" }, tags: ["Gender-Neutral", "Whispered", "Intimate", "Dry", "Vulnerable"], genres: ["Indie", "Folk"] },
  { name: { en: "Drill MC", pl: "Drill MC" }, tags: ["Male", "Deep", "UK Accent", "Flow", "Dark"], genres: ["Drill", "Grime"] }
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
  ...VOCAL_LAYERS,
  ...VOCAL_TECHNIQUES
];
