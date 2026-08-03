/**
 * Estimates the number of syllables in a text string.
 * Uses a regex heuristic based on vowel groupings.
 */
export const estimateSyllables = (text: string): number => {
  if (!text) return 0;
  
  // Remove non-alphabetic characters (except spaces for word boundaries if needed, but here we treat whole block)
  const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, '');
  
  if (cleanText.length === 0) return 0;

  // Split into words
  const words = cleanText.split(/\s+/);
  let totalSyllables = 0;

  words.forEach(word => {
    if (word.length <= 3) {
        totalSyllables += 1;
        return;
    }

    // Remove silent 'e' at end
    const core = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    
    // Count vowel groups
    const vowels = core.match(/[aeiouy]{1,2}/g);
    
    totalSyllables += vowels ? vowels.length : 1;
  });

  return totalSyllables;
};