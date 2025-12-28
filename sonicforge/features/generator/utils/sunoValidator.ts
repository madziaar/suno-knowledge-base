import { GeneratedPrompt, Language } from "../../../types";
import { sunoMetaTags } from "../data/sunoMetaTags";
import { MOOD_DESCRIPTORS } from "../data/genreDatabase";
import { translations } from "../../../translations";
import { estimateSyllables } from "./syllableCounter";

export interface SunoValidationResult {
  score: number; // 0 to 100
  issues: string[];
  suggestions: string[];
  conflicts: string[];
  status: 'critical' | 'warning' | 'good' | 'optimal';
  details: {
    completeness: number;
    specificity: number;
    balance: number;
    coherence: number;
  }
}

/**
 * Evaluates a Suno V4.5 prompt against best practices.
 * Checks for Completeness, Specificity, Structure, and Golden Rules (Front-loading, Density).
 */
export const validateSunoPrompt = (prompt: GeneratedPrompt, lang: Language = 'en'): SunoValidationResult => {
  const combinedText = `${prompt.style || ''} ${prompt.tags || ''}`.toLowerCase();
  const tagsText = (prompt.tags || '').toLowerCase();
  const styleText = (prompt.style || '').toLowerCase();
  const lyricsText = (prompt.lyrics || '').trim();
  
  // Load Translations with fallback to 'en'
  const tSet = translations[lang] || translations['en'];
  const tVal = tSet.builder.validation;

  // Define Conflicts with Localized Messages
  const CONFLICT_PAIRS = [
    { 
        a: ['energetic', 'aggressive', 'driving', 'fast', 'explosive', 'high energy'], 
        b: ['calm', 'relaxing', 'chill', 'serene', 'peaceful', 'laid back', 'mellow'], 
        message: tVal.conflictEnergy
    },
    { 
        a: ['acoustic', 'unplugged', 'folk', 'stripped back'], 
        b: ['electronic', 'synth', 'edm', 'dubstep', 'techno', 'house', 'robotic'], 
        message: tVal.conflictInstrument
    },
    {
        a: ['slow tempo', 'downtempo', '60 bpm', '70 bpm', '80 bpm'],
        b: ['fast tempo', 'upbeat', '170 bpm', '180 bpm', 'speed'], 
        message: tVal.conflictTempo
    }
  ];
  
  let completenessScore = 0;
  let specificityScore = 0;
  let balanceScore = 0;
  let coherenceScore = 20; // Start with full coherence
  
  const issues: string[] = [];
  const suggestions: string[] = [];
  const conflicts: string[] = [];

  // --- 1. COMPLETENESS CHECK (Max 30 pts) ---
  const hasGenre = sunoMetaTags.some(t => (t.category === 'genre' || t.category === 'subgenre') && combinedText.includes(t.name));
  if (hasGenre) completenessScore += 10;
  else {
      issues.push(tVal.missingGenre);
  }

  const hasMood = sunoMetaTags.some(t => t.category === 'mood' && combinedText.includes(t.name)) || 
                  Object.values(MOOD_DESCRIPTORS).flat().some(m => combinedText.includes(m.toLowerCase()));
  if (hasMood) completenessScore += 5;
  else {
      issues.push(tVal.missingMood);
  }

  const hasVocals = sunoMetaTags.some(t => t.category === 'vocals' && combinedText.includes(t.name)) ||
                    ['vocal', 'voice', 'singer', 'instrumental'].some(v => combinedText.includes(v));
  if (hasVocals) completenessScore += 5;
  else {
      issues.push(tVal.missingVocal);
  }

  const hasTempo = combinedText.includes('bpm') || ['fast', 'slow', 'tempo', 'upbeat', 'downtempo'].some(t => combinedText.includes(t));
  if (hasTempo) completenessScore += 5;
  else {
      suggestions.push(tVal.addBpm);
  }

  const hasInstruments = sunoMetaTags.some(t => t.category === 'instruments' && combinedText.includes(t.name)) ||
                         ['guitar', 'synth', 'bass', 'drum', 'piano', 'strings'].some(i => combinedText.includes(i));
  if (hasInstruments) completenessScore += 5;
  
  // --- 2. SPECIFICITY CHECK (Max 30 pts) ---
  const specificTags = sunoMetaTags.filter(t => 
    t.impact === 'high' && 
    (t.category === 'subgenre' || t.category === 'production' || t.category === 'technique') &&
    combinedText.includes(t.name)
  );
  specificityScore = Math.min(30, specificTags.length * 10);
  
  // --- 3. BALANCE & STRUCTURE CHECK (Max 20 pts) ---
  const wordCount = combinedText.split(/[\s,]+/).filter(Boolean).length;
  if (wordCount >= 8 && wordCount <= 35) {
      balanceScore += 20;
  } else if (wordCount < 8) {
      balanceScore += 5;
      issues.push(tVal.promptTooShort);
  } else {
      balanceScore += 10;
      suggestions.push(tVal.promptTooLong);
  }

  const tagItems = tagsText.split(',').filter(Boolean);
  if (tagItems.length > 5) {
      suggestions.push("Tag Overload (v4.5): Keep 'tags' field lean (max 5 items). Move details to Style description.");
      balanceScore = Math.max(0, balanceScore - 5);
  }

  if (styleText.length > 20) {
      const startOfStyle = styleText.substring(0, 50);
      const genreAtStart = sunoMetaTags.some(t => (t.category === 'genre' || t.category === 'subgenre') && startOfStyle.includes(t.name));
      const vocalsAtStart = sunoMetaTags.some(t => t.category === 'vocals' && startOfStyle.includes(t.name));
      if (!genreAtStart && hasGenre) {
          suggestions.push("Front-Load (v4.5): Put Genre/Mood at the very start of the style prompt.");
          specificityScore = Math.max(0, specificityScore - 5);
      }
      if (!vocalsAtStart && hasVocals) {
          suggestions.push("Front-Load (v4.5): Put Vocal Type early in the style prompt to lock the voice.");
      }
  }

  if (lyricsText && !lyricsText.toLowerCase().includes('[instrumental]')) {
      const lines = lyricsText.split('\n').filter(l => l.trim() && !l.trim().startsWith('['));
      let highSyllableLines = 0;
      lines.forEach(line => {
          if (estimateSyllables(line) > 12) highSyllableLines++;
      });
      if (highSyllableLines > 3) {
          suggestions.push("Lyric Density (v4.5): Keep lines 6-12 syllables for clear articulation. Some lines are too long.");
      }
  }

  // --- 4. COHERENCE & CONFLICT CHECK (Max 20 pts) ---
  CONFLICT_PAIRS.forEach(pair => {
      const hasA = pair.a.some(k => combinedText.includes(k));
      const hasB = pair.b.some(k => combinedText.includes(k));
      if (hasA && hasB) {
          conflicts.push(pair.message);
          coherenceScore -= 10;
      }
  });
  
  if (combinedText.includes('instrumental')) {
      const hasMixTags = ['reverb', 'eq', 'mix', 'mastered', 'polished', 'production', 'stereo'].some(t => combinedText.includes(t));
      if (!hasMixTags) {
          suggestions.push(tVal.instrumentalMixTip);
          specificityScore = Math.max(0, specificityScore - 5); 
      }
  }
  coherenceScore = Math.max(0, coherenceScore);

  // --- 5. LYRICS STRUCTURE ---
  if (!lyricsText.toLowerCase().includes('[instrumental]')) {
      if (!lyricsText.toLowerCase().includes('[end]') && !lyricsText.toLowerCase().includes('[fade out]') && !lyricsText.toLowerCase().includes('[outro]')) {
          issues.push(tVal.missingEnding);
          balanceScore = Math.max(0, balanceScore - 5);
      }
  }

  const totalScore = Math.min(100, completenessScore + specificityScore + balanceScore + coherenceScore);
  let status: SunoValidationResult['status'] = 'optimal';
  if (totalScore < 50) status = 'critical';
  else if (totalScore < 75) status = 'warning';
  else if (totalScore < 90) status = 'good';

  return {
    score: totalScore,
    issues,
    suggestions,
    conflicts,
    status,
    details: {
        completeness: completenessScore,
        specificity: specificityScore,
        balance: balanceScore,
        coherence: coherenceScore
    }
  };
};