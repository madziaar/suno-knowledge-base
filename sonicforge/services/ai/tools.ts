import { FunctionDeclaration, Schema, Type } from "@google/genai";
import { getClient } from "./client";
import { SAFETY_SETTINGS, STANDARD_IDENTITY, CHAOS_IDENTITY } from "./config";
import { SongSection, BatchConstraints, GeneratedPrompt } from "../../types";
import { VariationsSchema } from "../../types";
import { parseError, retryWithBackoff } from "./utils";

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

/**
 * AI Arranger Tool
 * Generates a structured song progression based on genre and target duration.
 */
export const generateArrangement = async (genre: string, duration: number, isPyriteMode: boolean): Promise<SongSection[]> => {
    const client = getClient();
    const prompt = `
        TASK: Architect a song structure for the genre: "${genre}" with a target duration of ${duration} seconds.
        RULES:
        1. Use Suno v4.5 pipe syntax for modifiers.
        2. If duration > 240, create at least 10 sections.
        3. Include energy shifts (e.g. [Chorus | High Energy] followed by [Bridge | Minimal]).
        4. End with [Instrumental Fade Out][End].

        OUTPUT: JSON Array of objects: [{"type": string, "modifiers": string[]}]
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                systemInstruction: isPyriteMode ? CHAOS_IDENTITY : STANDARD_IDENTITY,
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
        console.error("Arranger failed", e);
        return [];
    }
};

/**
 * Lyrical Translation Tool
 * Translates lyrics while strictly preserving English [Tags].
 */
export const translateLyrics = async (
  lyrics: string,
  targetLanguage: string,
  isPyriteMode: boolean
): Promise<string> => {
  const client = getClient();
  const prompt = `
    TASK: Translate the following lyrics into ${targetLanguage}.
    
    CRITICAL RULES:
    1. **Natural Phrasing**: Do not translate literally. Adapt idioms and rhymes to sound natural, poetic, and rhythmic in ${targetLanguage}.
    2. **Maintain Structure**: DO NOT translate [Square Brackets] tags. Keep them exactly as they are in English (e.g., [Verse], [Chorus | Fast]).
    3. **Content**: Translate all plain text and ad-libs in (parentheses).
    
    LYRICS:
    ${lyrics}
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: isPyriteMode ? "You are Pyrite, translating desire. Seductive, accurate, structured." : "Professional lyrical translator.",
        safetySettings: SAFETY_SETTINGS
      }
    });
    return response.text?.trim() || lyrics;
  } catch (e) {
    console.error("Translation failed", e);
    return lyrics;
  }
};

/**
 * Lyrical Refinement Tool
 * Increases dynamic range, varies sentence structure, and adds sensory details.
 */
export const refineLyrics = async (
  lyrics: string,
  genre: string,
  isPyriteMode: boolean,
  targetLanguage: string = 'English'
): Promise<string> => {
  const client = getClient();
  const prompt = `
    TASK: Refine these lyrics for a ${genre} song in ${targetLanguage}.
    
    OBJECTIVES:
    1. **Native Fluency**: Ensure the lyrics sound authentic to a native speaker of ${targetLanguage}. Fix awkward phrasing or translation artifacts. Use culturally appropriate idioms.
    2. **Dynamic Range**: Alternate between short, punchy phrases and longer, flowing descriptions.
    3. **Sensory Detail**: Inject visceral imagery (Sights, sounds, scents, textures). Make it feel real.
    4. **Varied Structure**: Avoid repetitive start-words or predictable rhyming couplets.
    5. **Maintain Tags**: Leave all [Section Tags] completely untouched.
    
    LYRICS:
    ${lyrics}
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: isPyriteMode ? "You are Pyrite, the hidden producer. Make it visceral, dark, and sensual. No cliches allowed." : "Professional Lyrical Editor.",
        safetySettings: SAFETY_SETTINGS,
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });
    return response.text?.trim() || lyrics;
  } catch (e) {
    console.error("Refinement failed", e);
    return lyrics;
  }
};

// --- LEGACY HELPER FUNCTIONS ---
export const quickEnhance = async (input: string, field: 'tags' | 'style'): Promise<string> => {
  const client = getClient();
  const charLimit = 1000;
  const target = 950;
  const prompt = `Enhance this Suno ${field} string to be extremely descriptive. Target approximately ${target} characters, but DO NOT EXCEED ${charLimit} characters. Add specific details, instruments, and adjectives. Keep it comma separated for tags. Output strictly in lowercase if field is 'tags'. Input: ${input}`;

  const execute = (model: 'gemini-3-flash-preview') => {
      return retryWithBackoff(async () => {
          // Fix: Added thinkingBudget when setting maxOutputTokens to follow coding guidelines
          const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.7,
              maxOutputTokens: 1100,
              thinkingConfig: { thinkingBudget: 100 },
              safetySettings: SAFETY_SETTINGS
            }
          });
          const result = response.text || input;
          return field === 'tags' ? result.toLowerCase() : result;
      });
  };
  
  try {
    return await execute('gemini-3-flash-preview');
  } catch (e: unknown) {
    console.warn("Quick Enhance failed", e);
    return input;
  }
};

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
  
  const execute = (model: 'gemini-3-flash-preview') => {
    return retryWithBackoff(async () => {
        // Fix: Added thinkingBudget when setting maxOutputTokens to follow coding guidelines
        const response = await client.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.8,
            maxOutputTokens: 200,
            thinkingConfig: { thinkingBudget: 50 },
            systemInstruction: isPyriteMode ? CHAOS_IDENTITY : STANDARD_IDENTITY,
            safetySettings: SAFETY_SETTINGS
          }
        });
        return response.text?.trim() || fragment;
    });
  };
  
  try {
    return await execute('gemini-3-flash-preview');
  } catch (e: unknown) {
    console.warn("Rewrite failed", e);
    return fragment;
  }
};

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
  
  const execute = (model: 'gemini-3-flash-preview') => {
      return retryWithBackoff(async () => {
          const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              safetySettings: SAFETY_SETTINGS
            }
          });
          const json = JSON.parse(response.text || '[]');
          return Array.isArray(json) ? json.slice(0, 12) : [];
      });
  };

  try {
    return await execute('gemini-3-flash-preview');
  } catch (e: unknown) {
    console.warn("Rhyme lookup failed", e);
    return [];
  }
};

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
  
  const execute = (model: 'gemini-3-flash-preview') => {
      return retryWithBackoff(async () => {
          // Fix: Added thinkingBudget when setting maxOutputTokens to follow coding guidelines
          const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.9,
              maxOutputTokens: 400,
              thinkingConfig: { thinkingBudget: 50 },
              systemInstruction: isPyriteMode ? CHAOS_IDENTITY : STANDARD_IDENTITY,
              safetySettings: SAFETY_SETTINGS
            }
          });
          return response.text?.trim() || "";
      });
  };
  
  try {
    return await execute('gemini-3-flash-preview');
  } catch (e: unknown) {
    console.warn("Ghostwriter failed", e);
    return "[Chorus]\n(Ghostwriter failed to connect)\n";
  }
};

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
  
  const execute = (model: 'gemini-3-flash-preview') => {
      return retryWithBackoff(async () => {
          const response = await client.models.generateContent({
            model,
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
      });
  };

  try {
    return await execute('gemini-3-flash-preview');
  } catch (e: unknown) {
    console.warn("Structure detection failed", e);
    return [];
  }
};

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

  // Use Gemini 3 Pro for creative batching as it requires complex adherence to constraints
  const primaryModel = 'gemini-3-pro-preview';

  const execute = (model: string) => {
    return retryWithBackoff(async () => {
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
    });
  };

  try {
    return await execute(primaryModel);
  } catch (e: unknown) {
    if (primaryModel === 'gemini-3-pro-preview') {
      console.warn("Batch Generation (Pro) failed, falling back to Flash", e);
      try {
        return await execute('gemini-3-flash-preview');
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