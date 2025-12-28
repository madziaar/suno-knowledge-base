
import { GeneratedPrompt, Language, PromptQualityScore } from "../../../types";
import { sunoMetaTags } from "../data/sunoMetaTags";
import { MOOD_DESCRIPTORS } from "../data/genreDatabase";
import { translations } from "../../../translations";
import { estimateSyllables } from "./syllableCounter";

/**
 * Evaluates a Suno V4.5 prompt against best practices.
 */
export const validateSunoPrompt = (prompt: GeneratedPrompt, lang: Language = 'en'): PromptQualityScore => {
  const combinedText = `${prompt.style || ''} ${prompt.tags || ''}`.toLowerCase();
  const tagsText = (prompt.tags || '').toLowerCase();
  const styleText = (prompt.style || '').toLowerCase();
  
  const tSet = translations[lang] || translations['en'];
  const tVal = tSet.builder.validation;

  const CONFLICT_PAIRS = [
    { a: ['energetic', 'driving', 'fast'], b: ['calm', 'relaxing', 'chill'], message: tVal.conflictEnergy },
    { a: ['acoustic', 'folk'], b: ['electronic', 'techno', 'dubstep'], message: tVal.conflictInstrument }
  ];
  
  let completenessScore = 0;
  let specificityScore = 0;
  let balanceScore = 0;
  let coherenceScore = 20; 
  
  const issues: string[] = [];
  const suggestions: string[] = [];
  const conflicts: string[] = [];

  // 1. COMPLETENESS (Max 30)
  const hasGenre = sunoMetaTags.some(t => (t.category === 'genre' || t.category === 'subgenre') && combinedText.includes(t.name));
  if (hasGenre) completenessScore += 10;
  else issues.push(tVal.missingGenre);

  const hasMood = sunoMetaTags.some(t => t.category === 'mood' && combinedText.includes(t.name)) || 
                  Object.values(MOOD_DESCRIPTORS).flat().some(m => combinedText.includes(m.toLowerCase()));
  if (hasMood) completenessScore += 10;
  else issues.push(tVal.missingMood);

  const hasVocals = sunoMetaTags.some(t => t.category === 'vocals' && combinedText.includes(t.name)) ||
                    ['vocal', 'voice', 'singer', 'instrumental'].some(v => combinedText.includes(v));
  if (hasVocals) completenessScore += 10;
  else issues.push(tVal.missingVocal);

  // 2. SPECIFICITY (Max 30)
  const specificTags = sunoMetaTags.filter(t => 
    t.impact === 'high' && 
    (t.category === 'subgenre' || t.category === 'production') &&
    combinedText.includes(t.name)
  );
  specificityScore = Math.min(30, specificTags.length * 10);
  
  // 3. BALANCE (Max 20)
  const wordCount = combinedText.split(/[\s,]+/).filter(Boolean).length;
  if (wordCount >= 8 && wordCount <= 35) balanceScore = 20;
  else if (wordCount < 8) { balanceScore = 5; issues.push(tVal.promptTooShort); }
  else { balanceScore = 10; suggestions.push(tVal.promptTooLong); }

  // 4. COHERENCE
  CONFLICT_PAIRS.forEach(pair => {
      if (pair.a.some(k => combinedText.includes(k)) && pair.b.some(k => combinedText.includes(k))) {
          conflicts.push(pair.message);
          coherenceScore -= 10;
      }
  });

  const totalScore = Math.min(100, completenessScore + specificityScore + balanceScore + Math.max(0, coherenceScore));
  
  let status: 'critical' | 'warning' | 'good' | 'optimal' = 'optimal';
  if (totalScore < 50) status = 'critical';
  else if (totalScore < 75) status = 'warning';
  else if (totalScore < 90) status = 'good';

  let grade = 'D';
  if (totalScore >= 95) grade = 'S';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 60) grade = 'C';

  return {
    totalScore,
    grade,
    issues,
    suggestions,
    conflicts,
    status,
    breakdown: {
        completeness: completenessScore,
        specificity: specificityScore,
        balance: balanceScore,
        coherence: coherenceScore
    }
  };
};
