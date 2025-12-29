
import { DESCRIPTOR_BANK, CONFLICT_PAIRS } from '../data/descriptorBank';
import { GENRE_DATABASE } from '../data/genreDatabase';
import { sunoMetaTags } from '../data/sunoMetaTags';

type EnhancementLevel = 'light' | 'medium' | 'heavy';

// V4.5 High-Fidelity Anchors
const FIDELITY_ANCHORS = [
    'Pristine studio quality', 'Modern radio-ready mastering', 'Crystal clear mix', 
    'Balanced frequency response', 'Wide stereo imaging', 'Deep transient punch',
    'No audio artifacts', 'High-end analog signal chain', 'Dolby Atmos', '4k Audio'
];

/**
 * Checks if a term conflicts with any existing terms in the prompt.
 */
const hasConflict = (currentPrompt: string, termToAdd: string): boolean => {
    const lowerPrompt = currentPrompt.toLowerCase();
    const lowerTerm = termToAdd.toLowerCase();

    for (const pair of CONFLICT_PAIRS) {
        // If the term we want to add is in group A, check if group B is in prompt
        if (pair.a.some(t => lowerTerm.includes(t))) {
            if (pair.b.some(t => lowerPrompt.includes(t))) return true;
        }
        // If the term we want to add is in group B, check if group A is in prompt
        if (pair.b.some(t => lowerTerm.includes(t))) {
            if (pair.a.some(t => lowerPrompt.includes(t))) return true;
        }
    }
    return false;
};

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

  // Detect Genre Context (More granular)
  let genreContext: keyof typeof DESCRIPTOR_BANK.genreSpecific = 'electronic';
  if (lower.includes('jazz') || lower.includes('blues') || lower.includes('swing')) genreContext = 'jazz';
  else if (lower.includes('metal') || lower.includes('core') || lower.includes('djent')) genreContext = 'metal';
  else if (lower.includes('rock') || lower.includes('punk') || lower.includes('grunge')) genreContext = 'rock';
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
 * THE CREATIVE BOOST EMULATOR
 * Enhances a basic prompt with rich descriptors based on intensity level.
 * Now features Smart Layering and Conflict Avoidance.
 */
export const enhancePrompt = (
  basicPrompt: string, 
  level: EnhancementLevel = 'medium'
): string => {
  if (!basicPrompt.trim()) return basicPrompt;

  let enhanced = basicPrompt;
  const analysis = analyzePrompt(basicPrompt);
  const lowerBasic = basicPrompt.toLowerCase();

  // Helper to safely add terms
  const addTerm = (term: string) => {
    // 1. Duplication Check
    if (enhanced.toLowerCase().includes(term.toLowerCase())) return;
    
    // 2. Conflict Check
    if (hasConflict(enhanced, term)) return;

    enhanced += `, ${term}`;
  };

  const getRandom = (list: string[]) => list[Math.floor(Math.random() * list.length)];

  // --- STAGE 1: LIGHT (Vibe & Tone) ---
  if (level === 'light' || level === 'medium' || level === 'heavy') {
    // Expand Mood using synonyms
    if (analysis.detectedMoods.length > 0) {
      analysis.detectedMoods.forEach(mood => {
        const expansions = DESCRIPTOR_BANK.moods[mood];
        if (expansions) addTerm(getRandom(expansions));
      });
    } else {
        // If no mood, add atmosphere
        addTerm(getRandom(DESCRIPTOR_BANK.atmosphere));
    }
  }

  // --- STAGE 2: MEDIUM (Production & Context) ---
  if (level === 'medium' || level === 'heavy') {
    // Add Production Anchor if missing
    if (!analysis.hasProduction) {
      addTerm(getRandom(DESCRIPTOR_BANK.production));
    }

    // Add Genre-Specific Gear/Techniques
    const genreTerms = DESCRIPTOR_BANK.genreSpecific[analysis.genreContext];
    if (genreTerms) {
        addTerm(getRandom(genreTerms));
        // Add a second one for flavor
        addTerm(getRandom(genreTerms)); 
    }
  }

  // --- STAGE 3: HEAVY (Fidelity & Narrative Depth) ---
  if (level === 'heavy') {
    // Specific Vocal Texture if missing
    if (!analysis.hasVocals) {
      addTerm(getRandom(DESCRIPTOR_BANK.vocals));
    }

    // Deep Atmospheric Layer
    addTerm(getRandom(DESCRIPTOR_BANK.atmosphere));
    
    // Sub-Genre Precision lookup from Database
    const matchedGenre = GENRE_DATABASE.find(g => lowerBasic.includes(g.name.toLowerCase()));
    if (matchedGenre) {
        // Inject a characteristic from the DB
        const characteristic = matchedGenre.characteristics[Math.floor(Math.random() * matchedGenre.characteristics.length)];
        addTerm(characteristic);
        
        // Maybe suggest a subgenre influence
        if (matchedGenre.subGenres.length > 0) {
             const sub = getRandom(matchedGenre.subGenres);
             addTerm(`${sub} influences`);
        }
    }

    // Mandatory High-Fidelity Lock for Heavy level
    addTerm(getRandom(FIDELITY_ANCHORS));
  }

  // Final Polish: Ensure BPM is present if missing (heuristic based on genre)
  if (!enhanced.toLowerCase().includes('bpm')) {
      const matchedGenre = GENRE_DATABASE.find(g => lowerBasic.includes(g.name.toLowerCase()));
      if (matchedGenre) {
           const avgBpm = Math.floor((matchedGenre.bpmRange[0] + matchedGenre.bpmRange[1]) / 2);
           addTerm(`${avgBpm} BPM`);
      }
  }

  return enhanced;
};
