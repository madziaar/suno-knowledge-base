
import { GENRE_OPTIMIZERS } from '../data/optimizationRules';

export interface OptimizationSuggestion {
  type: 'structure' | 'tag' | 'vocal' | 'technique' | 'regional';
  message: string;
}

export const getGenreOptimizations = (genreName: string): OptimizationSuggestion[] => {
  if (!genreName) return [];
  const normalizedGenre = genreName.toLowerCase();
  const suggestions: OptimizationSuggestion[] = [];

  const optimizer = GENRE_OPTIMIZERS.find(opt => 
    opt.keywords.some(k => normalizedGenre.includes(k))
  );

  if (!optimizer) return [];

  // 1. Regional Suggestions (Hip Hop)
  if (optimizer.regionalization) {
    Object.entries(optimizer.regionalization).forEach(([region, tags]) => {
      suggestions.push({
        type: 'regional',
        message: `${region}: "${tags.slice(0, 2).join(', ')}"`
      });
    });
  }

  // 2. Techniques
  if (optimizer.techniques) {
    optimizer.techniques.slice(0, 3).forEach(tech => {
      suggestions.push({
        type: 'technique',
        message: `Tip: ${tech}`
      });
    });
  }

  // 3. Structure Hints
  if (optimizer.structureHints) {
    suggestions.push({
      type: 'structure',
      message: `Structure: ${optimizer.structureHints.join(' > ')}`
    });
  }

  // 4. Key Tags (Subgenre specific)
  if (optimizer.keyTags) {
     Object.entries(optimizer.keyTags).forEach(([subgenre, tagString]) => {
       if (normalizedGenre.includes(subgenre.toLowerCase())) {
          suggestions.push({
            type: 'tag',
            message: `Key Tags for ${subgenre}: ${tagString}`
          });
       }
     });
  }

  // 5. Vocals
  if (optimizer.vocals) {
    Object.entries(optimizer.vocals).forEach(([style, desc]) => {
        suggestions.push({
            type: 'vocal',
            message: `${style} vocals: "${desc}"`
        });
    });
  }

  // 6. Avoid
  if (optimizer.avoid) {
      optimizer.avoid.slice(0, 2).forEach(a => {
          suggestions.push({
              type: 'technique',
              message: `Avoid: ${a}`
          });
      });
  }

  return suggestions;
};

// Function to automatically enhance a style string based on genre rules
export const applyGenreOptimizations = (genre: string, currentStyle: string): string => {
    const normalizedGenre = genre.toLowerCase();
    const optimizer = GENRE_OPTIMIZERS.find(opt => 
        opt.keywords.some(k => normalizedGenre.includes(k))
    );

    if (!optimizer) return currentStyle;

    let optimizedStyle = currentStyle;

    // Hip Hop optimizations
    if (optimizer.genreId === 'hip_hop') {
        if (!optimizedStyle.toLowerCase().includes('phonk drum') && !optimizedStyle.toLowerCase().includes('real drum')) {
            optimizedStyle += ', Phonk Drum'; // Critical for modern suno hip hop fidelity
        }
        if (!optimizedStyle.toLowerCase().includes('808') && normalizedGenre.includes('trap')) {
            optimizedStyle += ', 808 Bass';
        }
    }

    // Acoustic optimizations
    if (optimizer.genreId === 'acoustic') {
        if (!optimizedStyle.toLowerCase().includes('intimate')) {
            optimizedStyle += ', Intimate';
        }
        // Remove heavy processing terms if present? (Too complex for simple string append)
    }

    return optimizedStyle;
};
