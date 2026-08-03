
import { DESCRIPTOR_BANK } from '../data/descriptorBank';
import { GENRE_DATABASE } from '../data/genreDatabase';

type EnhancementLevel = 'light' | 'medium' | 'heavy';

// V4.5 Cleanup Phrases
const CLEANUP_PHRASES = [
    'no harsh highs', 'no vocal distortion', 'clean snare', 'modern mastering', 
    'studio-grade fidelity', 'crystal clear mix', 'balanced frequency response',
    'no artifacts', 'clean production', 'balanced mix'
];

/**
 * Analyzes the prompt to detect existing categories and potential genre context.
 */
export const analyzePrompt = (prompt: string) => {
  const lower = prompt.toLowerCase();
  
  // Detect Moods
  const detectedMoods = Object.keys(DESCRIPTOR_BANK.moods).filter(m => lower.includes(m));
  
  // Detect Technical Categories
  const hasProduction = DESCRIPTOR_BANK.production.some(p => lower.includes(p.toLowerCase()));
  const hasVocals = DESCRIPTOR_BANK.vocals.some(v => lower.includes(v.toLowerCase()));
  const hasAtmosphere = DESCRIPTOR_BANK.atmosphere.some(a => lower.includes(a.toLowerCase()));

  // Detect Genre Context (Naive)
  let genreContext = 'generic';
  if (lower.includes('rock') || lower.includes('metal') || lower.includes('punk')) genreContext = 'rock';
  else if (lower.includes('synth') || lower.includes('techno') || lower.includes('house') || lower.includes('edm')) genreContext = 'electronic';
  else if (lower.includes('rap') || lower.includes('hip') || lower.includes('trap') || lower.includes('drill')) genreContext = 'hiphop';
  else if (lower.includes('orchestra') || lower.includes('cinematic') || lower.includes('movie')) genreContext = 'orchestral';
  else if (lower.includes('acoustic') || lower.includes('folk') || lower.includes('country')) genreContext = 'acoustic';

  return {
    detectedMoods,
    hasProduction,
    hasVocals,
    hasAtmosphere,
    genreContext,
    length: prompt.length
  };
};

/**
 * Enhances a basic prompt with rich descriptors based on intensity level and context.
 */
export const enhancePrompt = (
  basicPrompt: string, 
  level: EnhancementLevel = 'medium'
): string => {
  if (!basicPrompt.trim()) return basicPrompt;

  let enhanced = basicPrompt;
  const analysis = analyzePrompt(basicPrompt);
  const lower = basicPrompt.toLowerCase();

  const addTerm = (term: string) => {
    if (!lower.includes(term.toLowerCase()) && !enhanced.toLowerCase().includes(term.toLowerCase())) {
      enhanced += `, ${term}`;
    }
  };

  const getRandom = (list: string[]) => list[Math.floor(Math.random() * list.length)];

  // --- LEVEL 1: LIGHT (Mood & Atmosphere) ---
  if (level === 'light' || level === 'medium' || level === 'heavy') {
    // 1. Expand Mood
    if (analysis.detectedMoods.length > 0) {
      analysis.detectedMoods.forEach(mood => {
        const expansions = DESCRIPTOR_BANK.moods[mood];
        if (expansions) addTerm(getRandom(expansions));
      });
    } else {
        // No mood detected? Add a generic atmospheric term
        if (!analysis.hasAtmosphere) addTerm(getRandom(DESCRIPTOR_BANK.atmosphere));
    }
  }

  // --- LEVEL 2: MEDIUM (Production & Genre Specifics) ---
  if (level === 'medium' || level === 'heavy') {
    // 2. Production Polish
    if (!analysis.hasProduction) {
      addTerm(getRandom(DESCRIPTOR_BANK.production));
    }

    // 3. Genre Specific Instrument/Texture
    const genreTerms = DESCRIPTOR_BANK.genreSpecific[analysis.genreContext];
    if (genreTerms) {
        addTerm(getRandom(genreTerms));
    }
  }

  // --- LEVEL 3: HEAVY (Vocals, Era, Deep Detail, Cleanup) ---
  if (level === 'heavy') {
    // 4. Vocal Character
    if (!analysis.hasVocals) {
      addTerm(getRandom(DESCRIPTOR_BANK.vocals));
    }

    // 5. Extra Atmosphere/Texture
    if (!analysis.hasAtmosphere) {
        addTerm(getRandom(DESCRIPTOR_BANK.atmosphere));
    }

    // 6. Another Genre Specific
    const genreTerms = DESCRIPTOR_BANK.genreSpecific[analysis.genreContext];
    if (genreTerms) {
        addTerm(getRandom(genreTerms));
    }
    
    // 7. Sub-Genre Precision (Check against Genre DB)
    const matchedGenre = GENRE_DATABASE.find(g => lower.includes(g.name.toLowerCase()));
    if (matchedGenre) {
        const characteristic = matchedGenre.characteristics[Math.floor(Math.random() * matchedGenre.characteristics.length)];
        addTerm(characteristic);
        
        // Maybe suggest a subgenre if only main genre present
        if (matchedGenre.subGenres.length > 0 && !matchedGenre.subGenres.some(s => lower.includes(s.toLowerCase()))) {
             addTerm(`${getRandom(matchedGenre.subGenres)} influences`);
        }
    }

    // 8. V4.5 Cleanup Phrases (New)
    // Add 1 random cleanup phrase to ensure fidelity for high-enhancement prompts
    addTerm(getRandom(CLEANUP_PHRASES));
  }

  return enhanced;
};
