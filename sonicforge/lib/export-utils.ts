import { GeneratedPrompt, SongConcept, HistoryItem, ExpertInputs } from '../types';

interface ExportData {
  inputs: SongConcept;
  // FIX: Added optional expertInputs to allow it in the export data object.
  expertInputs?: ExpertInputs;
  result: GeneratedPrompt;
  timestamp: number;
}

/**
 * Downloads data as a JSON file
 */
export const exportAsJSON = (data: ExportData | HistoryItem[], filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = href;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};


/**
 * Formats data for direct pasting into Suno
 */
export const exportAsSunoText = (result: GeneratedPrompt): string => {
  return `Title:
${result.title || ''}

Tags:
${result.tags || ''}

Style:
${result.style || ''}

Lyrics:
${result.lyrics || ''}
`;
};

/**
 * Downloads string content as a .txt file
 */
export const exportAsTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = href;
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

/**
 * Formats a batch of prompts into a single text file.
 */
export const exportBatchAsText = (prompts: GeneratedPrompt[], baseFilename: string): void => {
    let content = `--- BATCH EXPORT: ${prompts.length} Variations ---\n`;
    content += `Generated at: ${new Date().toISOString()}\n`;
    content += `Base: ${baseFilename}\n`;
    content += `----------------------------------------\n\n`;

    prompts.forEach((result, index) => {
        content += `// --- VARIATION ${index + 1} ---\n`;
        content += exportAsSunoText(result);
        content += `\n// --- END VARIATION ${index + 1} ---\n\n`;
        content += `----------------------------------------\n\n`;
    });

    exportAsTextFile(content, `${baseFilename}_batch_${Date.now()}.txt`);
};

/**
 * Formats data for Riffusion (Fuzz-1.1)
 * Riffusion prefers a single, dense descriptive string.
 * Priority: [Genre/Tags] + [Description/Style]
 */
export const exportAsRiffusionText = (result: GeneratedPrompt): string => {
  // Fuzz 1.1 Priority: Genre/Mood (Tags) first, then Details (Style)
  // This ensures the diffusion model anchors on the genre immediately.
  const parts = [result.tags, result.style].filter(Boolean);
  return parts.join(', ').replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Downloads data as a Markdown file
 */
export const exportAsMarkdown = (data: ExportData, filename: string) => {
  const md = `---
title: ${data.result.title || 'Untitled'}
date: ${new Date(data.timestamp).toISOString()}
tags: ${data.result.tags || 'none'}
---

# ${data.result.title || 'Untitled Project'}

## Configuration
- **Mode:** ${data.inputs.mode}
- **Intent:** ${data.inputs.intent}
- **Mood:** ${data.inputs.mood}
- **Instruments:** ${data.inputs.instruments}
- **Artist Ref:** ${data.inputs.artistReference || 'None'}

## Generation Output

### Style Description
> ${data.result.style || 'N/A'}

### Lyrics / Structure
\`\`\`text
${data.result.lyrics || ''}
\`\`\`

### Analysis
${data.result.analysis || 'No analysis provided.'}
`;

  const blob = new Blob([md], { type: 'text/markdown' });
  const href = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = href;
  link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};
