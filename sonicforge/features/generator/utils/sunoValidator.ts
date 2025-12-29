
import { GeneratedPrompt, Language, PromptQualityScore } from "../../../types";
import { sunoMetaTags } from "../data/sunoMetaTags";
import { MOOD_DESCRIPTORS } from "../data/genreDatabase";
import { translations } from "../../../translations";
import { CONFLICT_PAIRS } from "../data/descriptorBank";

/**
 * Evaluates a Suno V4.5 prompt against best practices.
 */
export const validateSunoPrompt = (prompt: GeneratedPrompt, lang: Language = 'en'): PromptQualityScore => {
  const combinedText = `${prompt.style || ''} ${prompt.tags || ''}`.toLowerCase();
  const styleText = (prompt.style || '').toLowerCase();
  const lyricsText = (prompt.lyrics || '').toLowerCase();
  
  const tSet = translations[lang] || translations['en'];
  const tVal = tSet.builder.validation;
  
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

  const hasVocals = combinedText.includes('vocal') || combinedText.includes('voice') || combinedText.includes('singer') || combinedText.includes('instrumental');
  if (hasVocals) completenessScore += 10;
  else issues.push(tVal.missingVocal);

  // 2. SPECIFICITY: THE 50-CHAR RULE (V4.5 Special)
  const first50 = styleText.substring(0, 50);
  const genreInFirst50 = sunoMetaTags.some(t => (t.category === 'genre' || t.category === 'subgenre') && first50.includes(t.name));
  if (genreInFirst50) specificityScore += 15;
  else suggestions.push("Hierarchical Weight Tip: Move Genre anchors to the start of the style prompt.");

  const vocalInFirst50 = combinedText.includes('male') || combinedText.includes('female') || combinedText.includes('duet') || combinedText.includes('choir') || combinedText.includes('instrumental');
  if (vocalInFirst50) specificityScore += 15;
  else suggestions.push("Hallucination Guard: Specify vocal gender right after the genre.");
  
  // 3. BALANCE (Max 20)
  const wordCount = combinedText.split(/[\s,]+/).filter(Boolean).length;
  if (wordCount >= 8 && wordCount <= 35) balanceScore = 20;
  else if (wordCount < 8) { balanceScore = 5; issues.push(tVal.promptTooShort); }
  else { balanceScore = 10; suggestions.push(tVal.promptTooLong); }

  // 4. SYNTAX AUDIT: BRACKETS & PIPES
  const openBrackets = (lyricsText.match(/\[/g) || []).length;
  const closeBrackets = (lyricsText.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    issues.push("Syntax Error: Mismatched square brackets [ ] detected.");
    coherenceScore -= 10;
  }

  const hasLegacyParenStructure = /\((intro|verse|chorus|bridge|outro)\)/i.test(lyricsText);
  if (hasLegacyParenStructure) {
    issues.push(tVal.structuralTagWarning);
    coherenceScore -= 5;
  }

  // 5. COHERENCE & POWER ENDING (Using Shared Conflict Pairs)
  CONFLICT_PAIRS.forEach(pair => {
      // Check if BOTH sides of the conflict pair exist in the prompt
      const hasA = pair.a.some(k => combinedText.includes(k));
      const hasB = pair.b.some(k => combinedText.includes(k));
      
      if (hasA && hasB) {
          conflicts.push(`${pair.message}: "${pair.a.find(k=>combinedText.includes(k))}" vs "${pair.b.find(k=>combinedText.includes(k))}"`);
          coherenceScore -= 10;
      }
  });

  const hasPowerEnding = lyricsText.includes('[end]') && (lyricsText.includes('fade out') || lyricsText.includes('[outro]'));
  if (!hasPowerEnding) {
      issues.push(tVal.missingEnding);
      coherenceScore -= 5;
  }
  
  // 6. GENRE SPECIFIC CHECKS
  if (combinedText.includes('trap') && !combinedText.includes('phonk')) {
      suggestions.push("Tip: Add 'Phonk Drum' for punchier Trap beats.");
  }
  if ((combinedText.includes('rock') || combinedText.includes('metal')) && !combinedText.includes('guitar')) {
      suggestions.push("Tip: Specify 'Electric Guitar' or 'Distorted Guitar' for clarity.");
  }

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
        coherence: Math.max(0, coherenceScore)
    }
  };
};
