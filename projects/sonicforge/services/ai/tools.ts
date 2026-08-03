

import { FunctionDeclaration, Schema, Type } from "@google/genai";
import { getClient } from "./client";
import { SAFETY_SETTINGS, STANDARD_IDENTITY, CHAOS_IDENTITY } from "./config";
import { SongSection, BatchConstraints, GeneratedPrompt } from "../../types";
import { VariationsSchema } from "../../types";
import { parseError } from "./utils";

// --- TOOL DEFINITIONS (V8.0) ---

export const TOOL_SEARCH: FunctionDeclaration = {
  name: "google_search",
  description: "Search the web for specific information about artists, genres, production techniques, or lyrics.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "The search query (e.g., 'Skrillex production style', 'Bossa Nova drum pattern')" }
    },
    required: ["query"]
  }
};

export const TOOL_RHYME: FunctionDeclaration = {
  name: "find_rhymes",
  description: "Finds rhymes for a specific word to help with lyric writing.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING, description: "The word to rhyme" },
      context: { type: Type.STRING, description: "Context of the song to find relevant rhymes" }
    },
    required: ["word"]
  }
};

// --- LEGACY HELPER FUNCTIONS (Maintained for UI components) ---

/**
 * Rapidly expands a short string (e.g. "dark techno") into a descriptive paragraph using Flash-Lite.
 * Used for the "Creative Boost" feature in the UI.
 */
export const quickEnhance = async (input: string, field: 'tags' | 'style'): Promise<string> => {
  const client = getClient();
  const charLimit = 1000;
  const target = 950;
  const prompt = `Enhance this Suno ${field} string to be extremely descriptive. Target approximately ${target} characters, but DO NOT EXCEED ${charLimit} characters. Add specific details, instruments, and adjectives. Keep it comma separated for tags. Output strictly in lowercase if field is 'tags'. Input: ${input}`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1100,
        safetySettings: SAFETY_SETTINGS
      }
    });
    const result = response.text || input;
    return field === 'tags' ? result.toLowerCase() : result;
  } catch (e: unknown) {
    console.warn("Quick Enhance (Lite) failed, retrying with Flash", e);
    // Fallback to Flash if Lite fails (e.g. overloaded)
    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 1100,
                safetySettings: SAFETY_SETTINGS
            }
        });
        const result = response.text || input;
        return field === 'tags' ? result.toLowerCase() : result;
    } catch (fallbackError) {
        return input;
    }
  }
};

/**
 * Rewrites a selected lyric fragment using AI to improve flow, rhyme, or style.
 * 
 * @param fragment - The text selection to rewrite.
 * @param context - The overall song context/theme.
 * @param mode - The rewrite strategy (Flow, Edgy, Rhyme, Extend, Chords).
 * @param isPyriteMode - Adjusts the creativity level.
 */
export const rewriteLyricFragment = async (
  fragment: string, 
  context: string, 
  mode: 'flow' | 'edgy' | 'rhyme' | 'extend' | 'chords', 
  isPyriteMode: boolean
): Promise<string> => {
  const client = getClient();
  const prompt = `
    TASK: Rewrite the following lyric fragment.
    FRAGMENT: "${fragment}"
    CONTEXT/SONG TOPIC: "${context}"
    MODE: ${mode.toUpperCase()}
    
    INSTRUCTIONS:
    - IF MODE IS 'FLOW': Fix the rhythm, syllable count, and meter to make it singable. Keep meaning similar.
    - IF MODE IS 'EDGY': Make it darker, cooler, more metaphorical, or aggressive. Use slang if appropriate.
    - IF MODE IS 'RHYME': Rewrite to improve rhyming with potential previous/next lines (inferred).
    - IF MODE IS 'EXTEND': Add melismatic vowel extensions to key words (e.g. 'goo-o-o-odbye', 'sta-a-ay') for emotional emphasis.
    - IF MODE IS 'CHORDS': Add musical chords in parentheses (e.g. (Am), (G7)) at appropriate changes within the text. **CRITICAL: CHECK THE CONTEXT FOR MUSICAL KEY. Use only chords valid for that key/genre.**
    
    OUTPUT: ONLY the rewritten text. No quotes. No explanation.
    LANGUAGE: Detect from fragment and keep same language.
  `;
  
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 200,
        systemInstruction: isPyriteMode ? CHAOS_IDENTITY : STANDARD_IDENTITY,
        safetySettings: SAFETY_SETTINGS
      }
    });
    return response.text?.trim() || fragment;
  } catch (e: unknown) {
    console.error("Rewrite failed", e);
    return fragment;
  }
};

/**
 * Finds rhymes for a specific word using AI, considering the song's context.
 */
export const getRhymes = async (word: string, context: string, language: string = 'en'): Promise<string[]> => {
  const client = getClient();
  const prompt = `
    Task: Provide 8-12 rhymes, near rhymes, or creative synonyms for the word: "${word}".
    Language: ${language}
    Context/Theme of song: "${context}"
    
    Output Format: JSON array of strings only. Example: ["rhyme1", "rhyme2"]
    
    Rules:
    - Include perfect rhymes.
    - Include slant/near rhymes (often better for modern music).
    - Prioritize words that fit the provided Context/Theme.
    - If the word is obscure, provide synonyms that fit the meter.
  `;
  
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite', // Fast and cheap
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        safetySettings: SAFETY_SETTINGS
      }
    });
    const json = JSON.parse(response.text || '[]');
    return Array.isArray(json) ? json.slice(0, 12) : [];
  } catch (e: unknown) {
    console.error("Rhyme lookup failed", e);
    return [];
  }
};

/**
 * Generates lyrics for Riffusion/Diffusion style models.
 * Focuses on phonetics and simple repetition rather than narrative.
 */
export const generateGhostLyrics = async (
  intent: string, 
  mood: string,
  artistReference: string,
  isPyriteMode: boolean
): Promise<string> => {
  const client = getClient();
  const prompt = `
    TASK: Write lyrics for a Riffusion generation.
    STYLE: ${mood}
    TOPIC: ${intent || 'General vibe'}
    ARTIST REF: ${artistReference || 'None'}
    
    RIFFUSION RULES:
    - Simple, repetitive hooks work best for diffusion models.
    - Short lines (under 8 syllables).
    - Use standard [Verse] and [Chorus] tags.
    - Max 12 lines total.
    - Focus on phonetics and rhythm.
    
    LANGUAGE RULE: Detect language from TOPIC/INTENT. Write lyrics in THAT SAME LANGUAGE. (e.g. Polish intent -> Polish lyrics).

    OUTPUT: Just the lyrics with tags. No conversation.
  `;
  
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.9,
        maxOutputTokens: 400,
        systemInstruction: isPyriteMode ? CHAOS_IDENTITY : STANDARD_IDENTITY,
        safetySettings: SAFETY_SETTINGS
      }
    });
    return response.text?.trim() || "";
  } catch (e: unknown) {
    console.error("Ghostwriter failed", e);
    return "[Chorus]\n(Ghostwriter failed to connect)\n";
  }
};

/**
 * Analyzes raw lyrics text to detect and label sections (Verse, Chorus, etc.).
 * Returns a structured array of song sections.
 */
export const detectStructure = async (lyrics: string, isPyriteMode: boolean): Promise<SongSection[]> => {
  const client = getClient();
  const prompt = `
    TASK: Analyze the following song lyrics and structure them into sections (Verse, Chorus, Bridge, etc.).
    LYRICS:
    "${lyrics.substring(0, 3000)}"

    OUTPUT: JSON Array of objects with 'type' (string) and 'modifiers' (string array).
    TYPES: Intro, Verse, Pre-Chorus, Chorus, Bridge, Outro, Solo, Instrumental.
    MODIFIERS: Extract mood/energy (e.g., "High Energy", "Soft", "Build-up") based on the text content.

    EXAMPLE OUTPUT:
    [{"type": "Verse", "modifiers": ["Storytelling"]}, {"type": "Chorus", "modifiers": ["Anthemic"]}]
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        safetySettings: SAFETY_SETTINGS
      }
    });
    const json = JSON.parse(response.text || "[]");
    return Array.isArray(json) ? json.map((s: any) => ({
        id: crypto.randomUUID(),
        type: s.type || "Verse",
        modifiers: Array.isArray(s.modifiers) ? s.modifiers : []
    })) : [];
  } catch (e) {
    console.error("Structure detection failed", e);
    return [];
  }
};

/**
 * Generates multiple variations of a prompt for A/B testing or brainstorming.
 * 
 * @param basePrompt - The original prompt to modify.
 * @param count - Number of variations to generate (1-10).
 * @param level - Intensity of variation (Light, Medium, Heavy).
 * @param constraints - Rules for what to keep/change.
 */
export const generateBatchVariations = async (
  basePrompt: GeneratedPrompt,
  count: number,
  level: 'light' | 'medium' | 'heavy',
  isPyriteMode: boolean,
  constraints: BatchConstraints
): Promise<GeneratedPrompt[]> => {
  const client = getClient();
  
  let constraintInstructions = `
    CREATIVE CONSTRAINTS (Follow these strictly):
  `;
  if(constraints.keepGenre) constraintInstructions += `- Keep Genre: The core genre(s) identified in the base prompt's style string must be preserved.\n`;
  if(constraints.keepStructure) constraintInstructions += `- Keep Structure: The lyrical structure ([Verse], [Chorus], etc.) must remain identical to the base prompt.\n`;
  if(constraints.randomizeMood) constraintInstructions += `- Randomize Mood: Actively change the mood descriptors to explore different emotional tones.\n`;
  if(constraints.randomizeVocals) constraintInstructions += `- Randomize Vocals: Actively change the vocal style descriptors (e.g., from 'male' to 'female', 'clean' to 'raspy').\n`;
  
  // If no constraints are active, don't include the block.
  if(Object.values(constraints).every(v => !v)) {
      constraintInstructions = '';
  }


  const prompt = `
    TASK: You are a creative music producer brainstorming alternatives. Generate ${count} variations of the following Suno V4.5 prompt.
    
    BASE PROMPT (JSON):
    ${JSON.stringify(basePrompt, null, 2)}

    VARIATION LEVEL: ${level.toUpperCase()}
    - LIGHT: Minor changes. Swap 1-2 related moods or instruments. Adjust BPM slightly. Keep the core genre and idea.
    - MEDIUM: Moderate changes. Introduce a sub-genre. Change vocal style. Swap several descriptors.
    - HEAVY: Significant changes. Blend with a different, compatible genre. Take a new creative direction on the same theme. Be bold.
    
    ${constraintInstructions}

    RULES:
    1.  Return a valid JSON array of ${count} full prompt objects.
    2.  Each object must match the structure of the base prompt (title, tags, style, lyrics, analysis).
    3.  For lyrics, unless 'keepStructure' is true, you should only make minor tweaks to fit the new vibe. DO NOT REWRITE ALL LYRICS from scratch.
    4.  Update the 'analysis' field in each variation to briefly explain what you changed and why.
    5.  Adhere to all Suno V4.5 constraints (character limits, tag format, etc.).

    OUTPUT: A valid JSON array of prompt objects, like this: [ { "title": "...", "tags": "...", ... }, { ... } ]
  `;

  // Determine model strategy: Pyrite uses Pro, Standard uses Flash.
  const primaryModel = isPyriteMode ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';

  const execute = async (model: string) => {
    const response = await client.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        safetySettings: SAFETY_SETTINGS,
        temperature: 0.8,
      }
    });
    const json = JSON.parse(response.text || '[]');
    return VariationsSchema.parse(json);
  };

  try {
    return await execute(primaryModel);
  } catch (e: unknown) {
    if (primaryModel === 'gemini-3-pro-preview') {
      console.warn("Batch Generation (Pro) failed, falling back to Flash", e);
      try {
        return await execute('gemini-2.5-flash');
      } catch (fallbackError: unknown) {
        console.error("Batch Generation Fallback failed", fallbackError);
        throw new Error(parseError(fallbackError));
      }
    } else {
      console.error("Batch Generation failed", e);
      throw new Error(parseError(e));
    }
  }
};
