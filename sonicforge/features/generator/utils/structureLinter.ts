
import { SongSection } from '../../../types';

export interface LintResult {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}

export const lintStructure = (text: string, lang: 'en' | 'pl' = 'en'): LintResult[] => {
  const results: LintResult[] = [];
  const lowerText = text.toLowerCase();

  // 1. CRITICAL SYNTAX CHECKS
  let openSquare = 0;
  let openParen = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '[') openSquare++;
    if (char === ']') openSquare--;
    if (char === '(') openParen++;
    if (char === ')') openParen--;
  }

  if (openSquare !== 0) {
    results.push({
      severity: 'error',
      message: lang === 'pl' ? 'Niedopasowane nawiasy kwadratowe [ ]. Sprawdź tagi.' : 'Mismatched Square Brackets [ ]. Check your structural tags.'
    });
  }
  if (openParen !== 0) {
    results.push({
      severity: 'warning',
      message: lang === 'pl' ? 'Niedopasowane nawiasy okrągłe ( ).' : 'Mismatched Parentheses ( ).'
    });
  }

  // 2. BAD HABITS (Parentheses for Structure)
  if (/\((intro|verse|chorus|bridge|outro|solo|instrumental|drop)\s*\d*\)/i.test(text)) {
    results.push({
      severity: 'error',
      message: lang === 'pl' 
        ? 'BŁĄD: Używasz ( ) dla struktury. AI zaśpiewa ten tekst. Użyj [ ].' 
        : 'CRITICAL: Structural tag found in ( ). AI will sing this. Use [ ].'
    });
  }

  // 3. V4.5 PIPE OPERATOR CHECK
  if (/\[[^\]]+ [^\]]+\]/.test(text) && !text.includes('|')) {
      results.push({
          severity: 'info',
          message: lang === 'pl' ? 'Wskazówka: Użyj | do oddzielenia modyfikatorów (np. [Chorus | Anthemic]).' : 'Tip: Use | to separate modifiers (e.g. [Chorus | Anthemic]).'
      });
  }

  // 4. STYLE CHECKS
  if (/\[(intro|verse|chorus|bridge|outro)\]/.test(text)) {
      results.push({
          severity: 'info',
          message: lang === 'pl' ? 'Wskazówka: Pisz główne sekcje z Wielkiej Litery (np. [Chorus]).' : 'Tip: Capitalize main sections (e.g., [Chorus]) for better adherence.'
      });
  }

  // 5. ENDING CHECK (V4.5 CRITICAL)
  if (!lowerText.includes('[end]') && !lowerText.includes('fade out') && !lowerText.includes('[outro]') && !lowerText.includes('[instrumental fade out]')) {
      results.push({
          severity: 'warning',
          message: lang === 'pl' 
            ? 'Brak tagu zakończenia (np. [End]). Może powodować nagłe ucięcie w v4.5.' 
            : 'Missing ending tag (e.g., [End]). Can cause abrupt cutoffs in v4.5.'
      });
  }

  return results;
};
