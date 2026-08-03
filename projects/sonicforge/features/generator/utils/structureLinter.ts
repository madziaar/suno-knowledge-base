
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
  // v4.5 is strict about this.
  if (/\((intro|verse|chorus|bridge|outro|solo|instrumental|drop)\s*\d*\)/i.test(text)) {
    results.push({
      severity: 'error',
      message: lang === 'pl' 
        ? 'BŁĄD: Używasz ( ) dla struktury. AI zaśpiewa ten tekst. Użyj [ ].' 
        : 'CRITICAL: Structural tag found in ( ). AI will sing this. Use [ ].'
    });
  }

  // 3. ARCHITECTURAL CHECKS
  // Check for duplicate sections without content
  const structuralTags = text.match(/\[(.*?)\]/g);
  
  if (structuralTags && structuralTags.length > 2) {
      for(let i = 0; i < structuralTags.length - 1; i++) {
          if (structuralTags[i] === structuralTags[i+1]) {
             // Check if there is text between them
             const idx1 = text.indexOf(structuralTags[i]);
             const idx2 = text.indexOf(structuralTags[i+1], idx1 + 1);
             const content = text.substring(idx1 + structuralTags[i].length, idx2).trim();
             if (!content) {
                 results.push({
                     severity: 'warning',
                     message: lang === 'pl' 
                        ? `Pusta sekcja wykryta: ${structuralTags[i]}` 
                        : `Empty section detected: ${structuralTags[i]}`
                 });
             }
          }
      }
  }

  // Section Variety Check
  if (structuralTags) {
      const types = new Set(structuralTags.map(t => t.toLowerCase().replace(/[^a-z]/g, '').replace(/\d+/g,'')));
      // Verse, Chorus, Intro, Outro...
      const hasChorus = Array.from(types).some(t => t.includes('chorus') || t.includes('hook') || t.includes('drop'));
      const hasVerse = Array.from(types).some(t => t.includes('verse'));
      
      if (hasVerse && !hasChorus && structuralTags.length > 3) {
          results.push({
              severity: 'info',
              message: lang === 'pl' ? 'Utwór ma wiele sekcji, ale brak Refrenu/Hooka.' : 'Song has multiple sections but lacks a Chorus/Hook.'
          });
      }
  }

  // 4. STYLE CHECKS
  // Check for lowercase structural tags
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
