
import { StructureTemplate } from '../../../types/generator';
import { STRUCTURE_TEMPLATES } from '../data/genreDatabase';

export type StructureType = 'pop' | 'hiphop' | 'electronic' | 'ballad' | 'progressive' | 'custom' | 'instrumental' | 'phonk' | 'dnb' | 'punk' | 'jazz' | 'eurobeat' | 'cinematic';

/**
 * Returns a recommended song structure based on genre, adjusted for duration.
 * Supports v4.5 extended duration (up to 8 minutes).
 */
export const generateStructure = (genre: string, durationSeconds: number = 180, isInstrumental: boolean = false): StructureTemplate => {
  const lowerGenre = genre.toLowerCase();

  if (isInstrumental) {
      // Intelligent Instrumental Structure Selection
      if (lowerGenre.includes('electronic') || lowerGenre.includes('edm') || lowerGenre.includes('house') || lowerGenre.includes('techno') || lowerGenre.includes('dubstep')) {
          return STRUCTURE_TEMPLATES.instrumental_electronic;
      }
      if (lowerGenre.includes('rock') || lowerGenre.includes('metal') || lowerGenre.includes('punk')) {
          return STRUCTURE_TEMPLATES.instrumental_rock;
      }
      if (lowerGenre.includes('jazz') || lowerGenre.includes('blues') || lowerGenre.includes('fusion')) {
          return STRUCTURE_TEMPLATES.instrumental_jazz;
      }
      // Default to generic Journey
      return STRUCTURE_TEMPLATES.instrumental_journey;
  }
  
  let baseTemplate: StructureTemplate;

  // Exact Sub-genre matching for better structure
  if (lowerGenre.includes('phonk') || lowerGenre.includes('memphis')) {
    baseTemplate = STRUCTURE_TEMPLATES.phonk;
  } else if (lowerGenre.includes('drum and bass') || lowerGenre.includes('dnb') || lowerGenre.includes('jungle')) {
    baseTemplate = STRUCTURE_TEMPLATES.dnb;
  } else if (lowerGenre.includes('punk') || lowerGenre.includes('hardcore')) {
    baseTemplate = STRUCTURE_TEMPLATES.punk;
  } else if (lowerGenre.includes('jazz') || lowerGenre.includes('swing') || lowerGenre.includes('blues')) {
    baseTemplate = STRUCTURE_TEMPLATES.jazz;
  } else if (lowerGenre.includes('eurobeat') || lowerGenre.includes('italo')) {
    baseTemplate = STRUCTURE_TEMPLATES.eurobeat;
  } else if (lowerGenre.includes('cinematic') || lowerGenre.includes('soundtrack') || lowerGenre.includes('ambient') || lowerGenre.includes('score')) {
    baseTemplate = STRUCTURE_TEMPLATES.cinematic;
  } else if (lowerGenre.includes('rap') || lowerGenre.includes('hip') || lowerGenre.includes('trap') || lowerGenre.includes('drill')) {
    baseTemplate = STRUCTURE_TEMPLATES.hiphop;
  } else if (lowerGenre.includes('electronic') || lowerGenre.includes('edm') || lowerGenre.includes('house') || lowerGenre.includes('techno') || lowerGenre.includes('dubstep')) {
    baseTemplate = STRUCTURE_TEMPLATES.electronic;
  } else if (lowerGenre.includes('ballad') || lowerGenre.includes('soul') || lowerGenre.includes('r&b')) {
    baseTemplate = STRUCTURE_TEMPLATES.ballad;
  } else if (lowerGenre.includes('prog') || lowerGenre.includes('post-rock')) {
    baseTemplate = STRUCTURE_TEMPLATES.progressive;
  } else {
    // Default to pop structure
    baseTemplate = STRUCTURE_TEMPLATES.pop;
  }
  
  // Deep copy the template to avoid mutating the constant
  const template = JSON.parse(JSON.stringify(baseTemplate)) as StructureTemplate;

  // v4.5 logic: If duration > 4 minutes (240s), extend structure
  // Max duration is now 480s (8 minutes)
  if (durationSeconds > 240) {
      const structure = template.structure as string[];
      
      // Determine expansion strategy based on genre
      const repeatBlock: string[] = [];
      
      if (template.name === "Standard Pop") {
          repeatBlock.push("Verse", "Pre-Chorus", "Chorus");
      } else if (template.name === "Hip Hop / Trap") {
          repeatBlock.push("Verse", "Hook");
      } else if (template.name === "Phonk / Memphis") {
          repeatBlock.push("Verse", "Hook");
      } else if (template.name === "EDM / Club") {
          // EDM benefits from extended build-drop cycles
          repeatBlock.push("Breakdown", "Build-up", "Drop");
      } else if (template.name === "Drum & Bass") {
          repeatBlock.push("Bridge", "Build-up", "Drop");
      } else if (template.name === "Progressive Journey") {
          repeatBlock.push("Development", "Solo");
      } else if (template.name === "Instrumental Journey") {
          repeatBlock.push("Theme A", "Solo");
      } else if (template.name === "Jazz Standard") {
          repeatBlock.push("Solo Section 1", "Trading 4s");
      } else {
          repeatBlock.push("Verse", "Chorus");
      }
      
      // Heuristic: add one block cycle for roughly every 90 seconds over the base 4-minute duration.
      // 4-8 mins means we can add 1 to 3 cycles.
      const extraTime = Math.min(durationSeconds, 480) - 240;
      const blocksToAdd = Math.max(1, Math.round(extraTime / 90));
      
      const bridgeIndex = structure.lastIndexOf('Bridge');
      const outroIndex = structure.findIndex(s => s.toLowerCase().includes('outro'));

      for (let i = 0; i < blocksToAdd; i++) {
        if (bridgeIndex !== -1) {
            // Insert after bridge if it exists (extended ending/climax)
            structure.splice(bridgeIndex + 1, 0, ...repeatBlock);
        } else if (outroIndex !== -1) {
            // Insert before outro
            structure.splice(outroIndex, 0, ...repeatBlock);
        } else {
            // Just append
            structure.push(...repeatBlock);
        }
      }
  }

  return template;
};

/**
 * Wraps a section type and modifiers in Suno-compliant brackets.
 * Example: "Chorus", ["High Energy"] -> "[Chorus | High Energy]"
 */
export const addMetaTags = (section: string, modifiers: string[] = []): string => {
  const cleanSection = section.replace(/[\[\]]/g, '').trim(); // Remove existing brackets if present
  
  // Capitalize first letter
  const formattedSection = cleanSection.charAt(0).toUpperCase() + cleanSection.slice(1);
  
  if (modifiers.length === 0) {
    return `[${formattedSection}]`;
  }
  
  return `[${formattedSection} | ${modifiers.join(' | ')}]`;
};


/**
 * Takes raw lyrics and applies a structure template.
 * Splits text by double newlines (paragraphs) and assigns sections.
 */
export const structureLyrics = (rawLyrics: string, structureType: StructureType | 'auto' = 'pop'): string => {
  if (!rawLyrics.trim()) return '';

  // 1. If input already has tags, return as is to avoid destroying manual work.
  if (rawLyrics.includes('[')) {
      return rawLyrics; 
  }

  // 2. Clean and Split Input into blocks
  const blocks = rawLyrics
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  // 3. Get Structure Template
  let template = STRUCTURE_TEMPLATES.pop;
  
  // Handle 'auto' or specific type
  if (structureType !== 'auto' && STRUCTURE_TEMPLATES[structureType]) {
      template = STRUCTURE_TEMPLATES[structureType];
  } else {
      // Fallback or specific 'auto' logic if passed elsewhere
      template = STRUCTURE_TEMPLATES.pop;
  }
  
  const sections = template.structure;

  let output = '';
  let blockIndex = 0;
  let sectionIndex = 0;

  // 4. Map Blocks to Sections
  while (blockIndex < blocks.length) {
    let currentSection = sections[sectionIndex];
    
    // If we run out of template sections, repeat Verse/Chorus pattern
    if (!currentSection) {
        currentSection = (sectionIndex % 2 === 0) ? 'Verse' : 'Chorus';
    }

    // Skip Intro/Outro/Breakdown/Instrumental tags when mapping text blocks, 
    // as these usually don't have user-provided lyrics in a simple paste scenario.
    // We want to map the user's text to Verses/Choruses primarily.
    if (['Intro', 'Outro', 'Instrumental', 'Solo', 'Breakdown', 'Build-up', 'Atmosphere', 'Synth Riff'].some(s => currentSection.includes(s)) && blockIndex < blocks.length) {
        output += addMetaTags(currentSection) + '\n\n';
        sectionIndex++;
        continue;
    }

    const tag = addMetaTags(currentSection);
    output += `${tag}\n${blocks[blockIndex]}\n\n`;

    blockIndex++;
    sectionIndex++;
  }

  // 5. Append a proper ending tag
  // Check the last few characters of output to see if we already have an ending
  const lowerOutput = output.toLowerCase();
  if (!lowerOutput.includes('[outro]') && !lowerOutput.includes('[end]') && !lowerOutput.includes('[fade out]')) {
     output += `\n[Outro]\n[Fade Out]`;
  }

  return output.trim();
};

/**
 * Generates a blank structure skeleton with placeholders.
 */
export const generateStructureSkeleton = (structureType: StructureType = 'pop'): string => {
    const template = STRUCTURE_TEMPLATES[structureType] || STRUCTURE_TEMPLATES.pop;
    return template.structure.map(section => {
        const tagName = section.includes(' ') ? section : section;
        return `[${tagName}]\n(Lyrics)\n`;
    }).join('\n');
};

/**
 * Checks for proper meta tag formatting and returns a list of warnings.
 */
export const validateMetaTags = (lyrics: string): string[] => {
    const warnings: string[] = [];
    const lower = lyrics.toLowerCase();
    
    // Check for ending tag (Critical for v4.5)
    if (!lower.includes('[end]') && !lower.includes('[fade out]') && !lower.includes('[outro]') && !lower.includes('[instrumental fade out]')) {
        warnings.push("Missing ending tag (e.g. [End], [Fade Out]). This can cause abrupt cutoffs in v4.5.");
    }
    
    // Check for incorrect bracket usage for structure
    if (/\((intro|verse|chorus|bridge|outro|instrumental|solo)\)/i.test(lyrics)) {
      warnings.push("Structural tag found in ( ). AI will sing this. Use [Square Brackets] instead.");
    }

    // Check for unclosed tags (simple check)
    if ((lyrics.split('[').length - 1) !== (lyrics.split(']').length - 1)) {
        warnings.push("Mismatched square brackets detected. Ensure all [tags] are properly closed.");
    }
    
    // Check for lines that look like tags but aren't
    const lines = lyrics.split('\n');
    lines.forEach((line, i) => {
        const trimmed = line.trim();
        // Heuristic: Short lines starting with Verse/Chorus without brackets
        if ((trimmed.startsWith('Verse') || trimmed.startsWith('Chorus') || trimmed.startsWith('Bridge')) && !trimmed.startsWith('[') && trimmed.length < 15) {
            warnings.push(`Line ${i+1}: Potential structural tag "${trimmed}" is missing brackets.`);
        }
    });

    return warnings;
};
