
import { capitalize } from '../../../lib/utils';

/**
 * Extends the first vowel group of a word.
 * "love", 2 -> "lo-o-o-ove" (V4.5 Melodic Effect)
 * KB: Uses hyphens for best V4.5 melisma interpretation.
 */
export const extendVowel = (word: string, level: number): string => {
  if (!word || level < 1) return word;

  const vowels = "aeiouyAEIOUY";
  const lowerWord = word.toLowerCase();
  let firstVowelIndex = -1;
  let vowelGroupEnd = -1;

  // Find the first vowel
  for (let i = 0; i < lowerWord.length; i++) {
    if (vowels.includes(lowerWord[i])) {
      firstVowelIndex = i;
      break;
    }
  }

  if (firstVowelIndex === -1) return word;

  // Find end of vowel group
  for (let i = firstVowelIndex; i < lowerWord.length; i++) {
    if (!vowels.includes(lowerWord[i])) {
      vowelGroupEnd = i;
      break;
    }
  }
  if (vowelGroupEnd === -1) vowelGroupEnd = word.length;

  const prefix = word.substring(0, vowelGroupEnd);
  const suffix = word.substring(vowelGroupEnd);
  const vowelToExtend = word.substring(vowelGroupEnd - 1, vowelGroupEnd);

  // V4.5 prefers hyphens for extensions to interpret as melisma
  // If extension is 2, word "love" becomes "lo-o-ove" (two hyphens added)
  const extension = `-${vowelToExtend}`.repeat(level);
  
  return `${prefix}${extension}${suffix}`;
};

/**
 * Formats background vocals based on strategy.
 * Uses V4.5 parentheses syntax.
 */
export const formatBackgroundVocals = (text: string, bgText: string, type: 'echo' | 'harmony' | 'call' = 'echo'): string => {
  const t = text.trim();
  const b = bgText.trim();
  
  if (!t && b) return `(${b})`;
  if (!b) return t;

  switch(type) {
      case 'echo': return `${t} (${b})`;
      case 'harmony': return `(${b}) ${t}`;
      case 'call': return `${t}\n(${b})`;
      default: return `${t} (${b})`;
  }
};

/**
 * Interleaves chords into lyrics using (Chord) syntax.
 */
export const formatChordLine = (text: string, chords: string[]): string => {
    if (chords.length === 0) return text;
    const words = text.split(/\s+/);
    
    // If text is empty, just return chords
    if (words.length === 0 || (words.length === 1 && !words[0])) return chords.map(c => `(${c})`).join(' ');

    const interval = Math.max(1, Math.floor(words.length / chords.length));
    let result: string[] = [];
    let chordIdx = 0;

    for (let i = 0; i < words.length; i++) {
        // Insert chord before word
        if (chordIdx < chords.length && (i % interval === 0 || i === 0)) {
            result.push(`(${chords[chordIdx]})`);
            chordIdx++;
        }
        result.push(words[i]);
    }
    
    // Append remaining chords
    while (chordIdx < chords.length) {
        result.push(`(${chords[chordIdx]})`);
        chordIdx++;
    }

    return result.join(' ');
};

/**
 * Interleaves notes with words for precise melodic control.
 * "Beat of the heart" + "G G A B" -> "(G)Beat (G)of (A)the (B)heart"
 */
export const interleaveNotes = (text: string, notesInput: string): string => {
    const words = text.trim().split(/\s+/);
    const notes = notesInput.trim().split(/\s+/);
    
    if (words.length === 0 || !words[0]) return '';
    if (notes.length === 0 || !notes[0]) return text;
    
    return words.map((word, i) => {
        // Cycle notes if fewer than words
        const note = notes[i % notes.length]; 
        return `(${note})${word}`;
    }).join(' ');
};

/**
 * Creates inline style descriptions for specific sections.
 * V4.5 Feature: (Section) [style]: Lyrics
 */
export const formatInlineStyle = (section: string, style: string, content: string): string => {
    const s = section.replace(/[()]/g, '').trim(); // Remove parens if user added them
    const st = style.replace(/[\[\]]/g, '').trim(); // Remove brackets if user added them
    return `(${s}) [${st}]:\n${content}`;
};

/**
 * Simplifies and optimizes tag formatting based on Suno Knowledge Base.
 * conversion: "Beautiful guitar solo" -> "[Guitar Solo]"
 * Also applies the "Repetition Hack" for instruments.
 */
export const optimizeTags = (input: string): string => {
    let s = input.toLowerCase().trim();
    
    // 1. Ending Tags (Critical for V4.5)
    if (s.includes('fade') || s.includes('ending')) return '[Fade Out]';
    if (s.includes('outro')) return '[Outro]';
    if (s.includes('end')) return '[End]';
    if (s.includes('stop')) return '[Stop]';
    
    // 2. Instrument Solos - Apply Repetition Hack for better adherence
    if (s.includes('sax')) return '[sax][saxophone][solo]';
    if (s.includes('piano') && s.includes('solo')) return '[piano][piano solo]';
    if (s.includes('guitar') && s.includes('solo')) return '[guitar][guitar solo]';
    if (s.includes('bass') && s.includes('solo')) return '[bass][bass solo]';
    if (s.includes('drum') && (s.includes('solo') || s.includes('break'))) return '[drum break]';

    // 3. Structure / Transitions
    if (s.includes('intro')) return '[Intro]';
    if (s.includes('drop')) return '[Drop]';
    if (s.includes('build')) return '[Build-up]';
    if (s.includes('break')) return '[Breakdown]';
    if (s.includes('silence')) return '[Silence]';
    
    // 4. Vocal Effects
    if (s.includes('scream')) return '[Heavy Female Screaming Section]'; // KB Specific
    if (s.includes('whisper')) return '[Whisper]';
    if (s.includes('spoken')) return '[Spoken Word]';
    if (s.includes('hook') && s.includes('catchy')) return '[Catchy Hook]';

    // Default capitalization for unknowns
    return `[${capitalize(s)}]`;
};
