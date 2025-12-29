
import { capitalize } from '../../../lib/utils';

/**
 * Extends the first vowel group of a word for melodic effect.
 * e.g., "goodbye", 2 -> "goo-o-o-odbye"
 * KB: Uses hyphens for best Suno V4.5 melisma interpretation.
 */
export const extendVowel = (word: string, level: number): string => {
  if (!word || level < 1) return word;

  const vowels = "aeiouyAEIOUY";
  const lowerWord = word.toLowerCase();
  let firstVowelIndex = -1;
  let vowelGroupEnd = -1;

  // Find the first vowel group
  for (let i = 0; i < lowerWord.length; i++) {
    if (vowels.includes(lowerWord[i])) {
      firstVowelIndex = i;
      break;
    }
  }

  if (firstVowelIndex === -1) return word;

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
  const extension = `-${vowelToExtend}`.repeat(level);
  
  return `${prefix}${extension}${suffix}`;
};

/**
 * Formats background vocals based on strategy using V4.5 parentheses syntax.
 */
export const formatBackgroundVocals = (text: string, bgText: string, type: 'echo' | 'harmony' | 'call' | 'layer' = 'echo'): string => {
  const t = text.trim();
  const b = bgText.trim();
  
  if (!t && b) return `(${b})`;
  if (!b) return t;

  switch(type) {
    case 'echo': return `${t} (${b})`;
    case 'harmony': return `(${b}) ${t}`;
    case 'call': return `${t}\n(${b})`;
    case 'layer': return `${t} (${b}) ${t}`;
    default: return `${t} (${b})`;
  }
};

/**
 * Interleaves chords into lyrics using (Chord) syntax.
 */
export const formatChordLine = (text: string, chords: string[]): string => {
  if (chords.length === 0) return text;
  const words = text.split(/\s+/);
  
  if (words.length === 0 || (words.length === 1 && !words[0])) {
    return chords.map(c => `(${c})`).join(' ');
  }

  const interval = Math.max(1, Math.floor(words.length / chords.length));
  let result: string[] = [];
  let chordIdx = 0;

  for (let i = 0; i < words.length; i++) {
    if (chordIdx < chords.length && (i % interval === 0 || i === 0)) {
      result.push(`(${chords[chordIdx]})`);
      chordIdx++;
    }
    result.push(words[i]);
  }
  
  while (chordIdx < chords.length) {
    result.push(`(${chords[chordIdx]})`);
    chordIdx++;
  }

  return result.join(' ');
};

/**
 * Interleaves notes with words for precise syllable-per-note control.
 * "Beat of the heart" + "G G A B" -> "(G)Beat (G)of (A)the (B)heart"
 */
export const interleaveNotes = (text: string, notesInput: string): string => {
  const words = text.trim().split(/\s+/);
  const notes = notesInput.trim().split(/\s+/);
  
  if (words.length === 0 || !words[0]) return '';
  if (notes.length === 0 || !notes[0]) return text;
  
  return words.map((word, i) => {
    const note = notes[i % notes.length]; 
    return `(${note})${word}`;
  }).join(' ');
};

/**
 * Parses a block of text and applies V4.5 background vocal notation to specific markers.
 * e.g., "Main line {backing}" -> "Main line (backing)"
 */
export const parseBackgroundNotation = (text: string): string => {
  return text.replace(/\{([^\}]+)\}/g, '($1)');
};

/**
 * Converts verbose tags to optimized structural tags using the "Repetition Hack".
 */
export const optimizeTags = (input: string): string => {
  let s = input.toLowerCase().trim();
  
  if (s.includes('fade') || s.includes('ending')) return '[Fade Out]';
  if (s.includes('outro')) return '[Outro]';
  if (s.includes('end')) return '[End]';
  
  if (s.includes('sax')) return '[sax][saxophone][solo]';
  if (s.includes('piano') && s.includes('solo')) return '[piano][piano solo]';
  if (s.includes('guitar') && s.includes('solo')) return '[guitar][guitar solo]';
  if (s.includes('bass') && s.includes('solo')) return '[bass][bass solo]';
  if (s.includes('drum') && (s.includes('solo') || s.includes('break'))) return '[drum break]';

  if (s.includes('intro')) return '[Intro]';
  if (s.includes('drop')) return '[Drop]';
  if (s.includes('build')) return '[Build-up]';
  if (s.includes('break')) return '[Breakdown]';
  
  if (s.includes('scream')) return '[Heavy Female Screaming Section]';
  if (s.includes('whisper')) return '[Whisper]';
  if (s.includes('hook') && s.includes('catchy')) return '[Catchy Hook]';

  return `[${capitalize(s)}]`;
};
