
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
      if (lowerGenre.includes('electronic') || lowerGenre.includes('edm') || lowerGenre.includes('house') || lowerGenre.includes('techno') || lowerGenre.includes('dubstep')) {
          return STRUCTURE_TEMPLATES.instrumental_electronic;
      }
      if (lowerGenre.includes('rock') || lowerGenre.includes('metal') || lowerGenre.includes('punk')) {
          return STRUCTURE_TEMPLATES.instrumental_rock;
      }
      if (lowerGenre.includes('jazz') || lowerGenre.includes('blues') || lowerGenre.includes('fusion')) {
          return STRUCTURE_TEMPLATES.instrumental_jazz;
      }
      return STRUCTURE_TEMPLATES.instrumental_journey;
  }
  
  let baseTemplate: StructureTemplate;

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
    baseTemplate = STRUCTURE_TEMPLATES.pop;
  }
  
  const template = JSON.parse(JSON.stringify(baseTemplate)) as StructureTemplate;

  // v4.5 logic: Extended duration optimization (up to 8 minutes / 480s)
  if (durationSeconds > 240) {
      const structure = template.structure as string[];
      
      const repeatBlock: string[] = [];
      if (template.name === "Standard Pop") repeatBlock.push("Verse", "Pre-Chorus", "Chorus");
      else if (template.name === "Hip Hop / Trap") repeatBlock.push("Verse", "Hook");
      else if (template.name === "EDM / Club") repeatBlock.push("Breakdown", "Build-up", "Drop");
      else if (template.name === "Drum & Bass") repeatBlock.push("Bridge", "Build-up", "Drop");
      else repeatBlock.push("Verse", "Chorus");
      
      // Calculate how many large blocks to add to fill up to 8 mins
      const extraTime = Math.min(durationSeconds, 480) - 240;
      const blocksToAdd = Math.max(1, Math.round(extraTime / 90));
      
      const bridgeIndex = structure.lastIndexOf('Bridge');
      const outroIndex = structure.findIndex(s => s.toLowerCase().includes('outro'));

      for (let i = 0; i < blocksToAdd; i++) {
        if (bridgeIndex !== -1) {
            // Insert thematic movement shift
            structure.splice(bridgeIndex + 1, 0, "Theme Shift", ...repeatBlock, "Grand Bridge");
        } else if (outroIndex !== -1) {
            structure.splice(outroIndex, 0, ...repeatBlock);
        } else {
            structure.push(...repeatBlock);
        }
      }
      
      // Force v4.5 ending clarity
      if (!structure.includes('Instrumental Fade Out')) {
          structure.push('Instrumental Fade Out');
      }
      if (!structure.includes('End')) {
          structure.push('End');
      }
  }

  return template;
};

export const addMetaTags = (section: string, modifiers: string[] = []): string => {
  const cleanSection = section.replace(/[\[\]]/g, '').trim();
  const formattedSection = cleanSection.charAt(0).toUpperCase() + cleanSection.slice(1);
  if (modifiers.length === 0) return `[${formattedSection}]`;
  return `[${formattedSection} | ${modifiers.join(' | ')}]`;
};

export const structureLyrics = (rawLyrics: string, structureType: StructureType | 'auto' = 'pop'): string => {
  if (!rawLyrics.trim()) return '';
  if (rawLyrics.includes('[')) return rawLyrics; 

  const blocks = rawLyrics.replace(/\r\n/g, '\n').split(/\n\s*\n/).map(b => b.trim()).filter(b => b.length > 0);
  let template = STRUCTURE_TEMPLATES.pop;
  if (structureType !== 'auto' && STRUCTURE_TEMPLATES[structureType]) {
      template = STRUCTURE_TEMPLATES[structureType];
  }
  
  const sections = template.structure;
  let output = '';
  let blockIndex = 0;
  let sectionIndex = 0;

  while (blockIndex < blocks.length) {
    let currentSection = sections[sectionIndex];
    if (!currentSection) currentSection = (sectionIndex % 2 === 0) ? 'Verse' : 'Chorus';

    if (['Intro', 'Outro', 'Instrumental', 'Solo', 'Breakdown', 'Build-up', 'Atmosphere', 'Synth Riff'].some(s => currentSection.includes(s)) && blockIndex < blocks.length) {
        output += addMetaTags(currentSection) + '\n\n';
        sectionIndex++;
        continue;
    }

    output += `${addMetaTags(currentSection)}\n${blocks[blockIndex]}\n\n`;
    blockIndex++;
    sectionIndex++;
  }

  const lowerOutput = output.toLowerCase();
  if (!lowerOutput.includes('[end]') && !lowerOutput.includes('[fade out]')) {
     output += `\n[Outro]\n[Fade Out]\n[End]`;
  }

  return output.trim();
};

export const generateStructureSkeleton = (structureType: StructureType = 'pop'): string => {
    const template = STRUCTURE_TEMPLATES[structureType] || STRUCTURE_TEMPLATES.pop;
    return template.structure.map(section => `[${section}]\n(Lyrics)\n`).join('\n');
};

export const validateMetaTags = (lyrics: string): string[] => {
    const warnings: string[] = [];
    const lower = lyrics.toLowerCase();
    if (!lower.includes('[end]') && !lower.includes('[fade out]') && !lower.includes('[outro]')) {
        warnings.push("Missing ending tag. Suno v4.5 prefers [End] for clean termination.");
    }
    if (/\((intro|verse|chorus|bridge|outro|instrumental|solo)\)/i.test(lyrics)) {
      warnings.push("Structural tag found in ( ). AI will sing this. Use [Brackets].");
    }
    if ((lyrics.split('[').length - 1) !== (lyrics.split(']').length - 1)) {
        warnings.push("Mismatched square brackets.");
    }
    return warnings;
};
