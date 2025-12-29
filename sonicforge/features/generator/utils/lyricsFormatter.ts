
import { StructureTemplate } from '../../../types/generator';
import { STRUCTURE_TEMPLATES } from '../data/genreDatabase';
import { capitalize } from '../../../lib/utils';
import { lintStructure } from './structureLinter';

export type StructureType = 'pop' | 'hiphop' | 'electronic' | 'ballad' | 'progressive' | 'custom' | 'instrumental' | 'phonk' | 'dnb' | 'punk' | 'jazz' | 'eurobeat' | 'cinematic';

/**
 * Ensures a section tag is properly capitalized and formatted for Suno V4.5.
 * e.g., "[chorus | energetic]" -> "[Chorus | Energetic]"
 */
export const formatSectionTag = (rawTag: string): string => {
  // Remove brackets to process content
  const content = rawTag.replace(/[\[\]]/g, '').trim();
  if (!content) return '';

  // Split by pipe, clean each part, and Title Case it
  const parts = content.split('|').map(p => {
    const trimmed = p.trim();
    // Special handling for known acronyms if needed, otherwise Title Case
    return trimmed.replace(/\b\w/g, c => c.toUpperCase());
  });

  return `[${parts.join(' | ')}]`;
};

/**
 * Adds meta tags to a specific section with optional modifiers.
 */
export const addMetaTags = (section: string, modifiers: string[] = []): string => {
  const content = [section, ...modifiers].filter(Boolean).join(' | ');
  return formatSectionTag(`[${content}]`);
};

/**
 * Returns a recommended song structure based on genre, adjusted for duration.
 * Supports v4.5 extended duration (up to 8 minutes).
 */
export const generateStructure = (genre: string, durationSeconds: number = 180, isInstrumental: boolean = false): StructureTemplate => {
  const lowerGenre = genre.toLowerCase();

  // 1. Select Base Template
  let baseTemplate: StructureTemplate = STRUCTURE_TEMPLATES.pop; // Default

  if (isInstrumental) {
     if (lowerGenre.includes('electronic') || lowerGenre.includes('edm')) baseTemplate = STRUCTURE_TEMPLATES.instrumental_electronic;
     else if (lowerGenre.includes('rock') || lowerGenre.includes('metal')) baseTemplate = STRUCTURE_TEMPLATES.instrumental_rock;
     else if (lowerGenre.includes('jazz')) baseTemplate = STRUCTURE_TEMPLATES.instrumental_jazz;
     else baseTemplate = STRUCTURE_TEMPLATES.instrumental_journey;
  } else {
    if (lowerGenre.includes('phonk') || lowerGenre.includes('memphis')) baseTemplate = STRUCTURE_TEMPLATES.phonk;
    else if (lowerGenre.includes('dnb') || lowerGenre.includes('drum')) baseTemplate = STRUCTURE_TEMPLATES.dnb;
    else if (lowerGenre.includes('punk')) baseTemplate = STRUCTURE_TEMPLATES.punk;
    else if (lowerGenre.includes('jazz')) baseTemplate = STRUCTURE_TEMPLATES.jazz;
    else if (lowerGenre.includes('rap') || lowerGenre.includes('hip') || lowerGenre.includes('trap')) baseTemplate = STRUCTURE_TEMPLATES.hiphop;
    else if (lowerGenre.includes('electronic') || lowerGenre.includes('edm')) baseTemplate = STRUCTURE_TEMPLATES.electronic;
    else if (lowerGenre.includes('ballad')) baseTemplate = STRUCTURE_TEMPLATES.ballad;
    else if (lowerGenre.includes('prog')) baseTemplate = STRUCTURE_TEMPLATES.progressive;
  }
  
  // Clone to avoid mutating constant
  const template = JSON.parse(JSON.stringify(baseTemplate)) as StructureTemplate;

  // 2. Adjust for Duration (V4.5 8-minute logic)
  if (durationSeconds > 240) {
    const structure = template.structure as string[];
    
    // Identify repeatable block
    const repeatBlock: string[] = [];
    if (template.name === "Standard Pop") repeatBlock.push("Verse", "Pre-Chorus", "Chorus");
    else if (template.name.includes("Hip Hop")) repeatBlock.push("Verse", "Hook");
    else if (template.name.includes("EDM")) repeatBlock.push("Build-up", "Drop");
    else repeatBlock.push("Verse", "Chorus");
    
    const extraTime = Math.min(durationSeconds, 480) - 240;
    const blocksToAdd = Math.max(1, Math.round(extraTime / 90)); // ~90s per block
    
    // Insert before Bridge or Outro
    const bridgeIndex = structure.lastIndexOf('Bridge');
    const outroIndex = structure.findIndex(s => s.toLowerCase().includes('outro'));
    const insertIndex = bridgeIndex !== -1 ? bridgeIndex : (outroIndex !== -1 ? outroIndex : structure.length - 1);

    for (let i = 0; i < blocksToAdd; i++) {
        structure.splice(insertIndex, 0, ...repeatBlock);
    }
    
    // Ensure Power Ending
    if (!structure.includes('Instrumental Fade Out')) {
        // Insert before End or last element
        const endIdx = structure.indexOf('End');
        if (endIdx !== -1) structure.splice(endIdx, 0, 'Instrumental Fade Out');
        else structure.push('Instrumental Fade Out');
    }
  }

  // Ensure Termination Protocol
  if (!template.structure.includes('End') && !template.structure.includes('Fade Out')) {
      template.structure.push('End');
  }

  // Capitalize tags
  template.structure = template.structure.map(s => capitalize(s));

  return template;
};

/**
 * Automatically structures raw lyrics into a song format using a template.
 */
export const structureLyrics = (rawLyrics: string, structureType: StructureType | 'auto' = 'pop'): string => {
  if (!rawLyrics.trim()) return '';
  
  // If text already contains structural tags, just ensure they are formatted correctly
  if (rawLyrics.includes('[')) {
    return rawLyrics.replace(/\[([^\]]+)\]/g, (match) => formatSectionTag(match));
  }

  const blocks = rawLyrics.replace(/\r\n/g, '\n').split(/\n\s*\n/).map(b => b.trim()).filter(b => b.length > 0);
  let template = STRUCTURE_TEMPLATES.pop;
  
  if (structureType !== 'auto' && STRUCTURE_TEMPLATES[structureType]) {
    template = STRUCTURE_TEMPLATES[structureType];
  }
  
  const sections = template.structure.filter(s => !['Intro', 'Outro', 'End', 'Instrumental Fade Out'].includes(s)); // Only use lyrical sections for mapping
  let output = `[Intro]\n\n`;
  
  blocks.forEach((block, index) => {
      // Round robin assignment of sections if blocks exceed template
      const sectionName = sections[index % sections.length] || 'Verse';
      output += `${addMetaTags(sectionName)}\n${block}\n\n`;
  });

  const lowerOutput = output.toLowerCase();
  if (!lowerOutput.includes('[end]') && !lowerOutput.includes('[fade out]')) {
    output += `[Outro]\n[Instrumental Fade Out]\n[End]`;
  }

  return output.trim();
};

/**
 * Syntax validation and cleanup for lyrics text.
 */
export const autoFormatLyrics = (text: string): string => {
  if (!text) return '';
  
  return text
    // 1. Fix mismatched brackets (simple correction)
    .replace(/\[([^\]]+)(?!\])$/gm, '[$1]')
    // 2. Format all structural tags
    .replace(/\[([^\]]+)\]/g, (match) => formatSectionTag(match))
    // 3. Ensure single space after pipe operators
    .replace(/\|\s*/g, ' | ')
    .replace(/\s*\|\s*/g, ' | ') // Normalize spaces around pipe
    // 4. Ensure structural tags are on their own lines
    .replace(/([^\n])\s*(\[[^\]]+\])/g, '$1\n$2')
    .replace(/(\[[^\]]+\])\s*([^\n])/g, '$1\n$2')
    // 5. Cleanup redundant whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const generateStructureSkeleton = (structureType: StructureType = 'pop'): string => {
  const template = STRUCTURE_TEMPLATES[structureType] || STRUCTURE_TEMPLATES.pop;
  
  return template.structure.map(section => {
      const sectionType = section.split('|')[0].trim().replace('[', '').replace(']', '');
      const guideline = template.guidelines?.[sectionType];
      
      let comment = '';
      if (guideline) {
          comment = `\n(${guideline.lineCount > 0 ? `${guideline.lineCount} lines, ` : ''}${guideline.description})`;
      } else if (['Intro', 'Outro', 'Instrumental Fade Out', 'End'].includes(sectionType)) {
          // Instrumental sections usually don't need line hints
          comment = '';
      } else {
          comment = '\n(Lyrics)';
      }

      return `[${section}]${comment}\n`;
  }).join('\n');
};

/**
 * Validates lyrics for meta tag correctness using the shared linter logic.
 */
export const validateMetaTags = (lyrics: string) => {
    return lintStructure(lyrics, 'en');
};
