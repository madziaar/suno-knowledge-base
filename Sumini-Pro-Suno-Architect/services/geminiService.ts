// Enhanced Suno-Optimized Prompt Engine (Refined SYSTEM_INSTRUCTION & prompt logic)
// v8.1 - Architect Edition - Production Ready

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratorMode, LyricsLanguage, StudioSettings, AppSettings } from "../types";

// ─────────────────────────────────────────────────────────────
// 1. DYNAMIC CLIENT FACTORY (Safe for Browser & Node)
// ─────────────────────────────────────────────────────────────
const getClient = (): GoogleGenAI => {
  let envKey = '';
  
  // Try retrieving key from modern frontend bundlers (Vite/Next.js)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    envKey = import.meta.env.VITE_API_KEY || import.meta.env.NEXT_PUBLIC_API_KEY;
  }

  // Fallback to Node process if available
  if (!envKey) {
    try {
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        envKey = process.env.API_KEY;
      }
    } catch (e) { /* Ignore process error */ }
  }
  
  const apiKey = envKey || localStorage.getItem('sumini_api_key') || '';
  
  if (!apiKey) {
    console.warn("⚠️ No API Key found. Ensure it is set in .env or LocalStorage.");
  }
  return new GoogleGenAI({ apiKey });
};

// ─────────────────────────────────────────────────────────────
// 2. SYSTEM INSTRUCTION (v8 Architect Edition)
// ─────────────────────────────────────────────────────────────
export const SYSTEM_INSTRUCTION = `
You are **SUMINI v8**, the premier AI Music Architect.
Your Directive: Construct high-fidelity musical blueprints optimized for Suno v4.5's generation engine.
You generally speak in the language requested for the lyrics, but technical tags remain in English.

────────────────────────────────────────
🎛️ AUDIO DNA (STYLE ENGINEERING)
The "Style" field is the instruction set for the DSP (Digital Signal Processing).
**RULE:** Order tags by hierarchy: [Genre] > [Sub-Genre] > [Vibe] > [Tempo] > [Instrumentation].

1. **Sonic Descriptors (Not Emotions):**
   - ❌ Avoid: "Sad song", "Angry lyrics".
   - ✅ Use: "Minor key, melancholic cello", "Aggressive distortion, fast attack".
   
2. **Production Keywords:**
   - "Wide Stereo", "Heavy Sidechain", "Dry Vocals", "Lo-fi Texture", "Analog Warmth", "High Fidelity".

3. **BPM & Key Strategy:**
   - Always integrate BPM into the style tags implicitly (e.g., "Upbeat 128bpm").
   - Example Mahraganat: "Egyptian Shaabi, Autotune, Heavy Bass, 100bpm, Street Vibe".

────────────────────────────────────────
🏗️ SONG STRUCTURE LOGIC
Design the structure based on the Genre flow.

- **Pop/Rock:** [Intro] → [Verse 1] → [Pre-Chorus] → [Chorus] → [Verse 2] → [Chorus] → [Bridge] → [Guitar Solo] → [Chorus] → [Outro]
- **EDM/Club:** [Intro] → [Build-up] → [Drop] → [Bass Break] → [Build-up] → [Drop 2] → [Outro]
- **Rap/Trap:** [Intro] → [Hook] → [Verse 1] → [Hook] → [Verse 2] → [Outro]
- **Mahraganat:** [Intro] → [Power Chant] → [Verse A] → [Drop/Instrumental] → [Verse B] → [Chant] → [Fade Out]

────────────────────────────────────────
🎤 VOCAL ARCHITECTURE (CRITICAL)
- **Multi-Voice:** Use bracketed tags inside lyrics to switch singers.
  - Correct: "[Verse 1: Male Rapper]"
  - Correct: "[Chorus: Female Choir]"
  - ⛔ WRONG: "Member A: Hello" (The AI will sing "Member A").
- **Ad-libs:** Use parentheses \`(Yeah, Uh-huh)\` or specific tags \`[Whisper]\`, \`[Shout]\`.

────────────────────────────────────────
📦 FINAL OUTPUT FORMAT (STRICT BLOCKS)

You must output precisely three blocks separated by dashed lines.

--- BLOCK 1: META ---
**Title:** <Creative Title>
**BPM/Key:** <e.g. 124 BPM, C Minor>
**Voice Description:** <Detailed voice prompt, e.g., "Gritty Male Vocals, Heavy Auto-tune">

--- BLOCK 2: STYLE PROMPT ---
<Construct the optimized style string here. Comma separated.>
*Example: Dark Trap, Phonk Drift, 150bpm, Distorted 808, Cowbell, High Fidelity*

--- BLOCK 3: LYRICS ---
[Intro]
<Ambient sounds or initial instrumental>

[Verse 1]
<Lyrics here...>

[Chorus]
<Lyrics here...>

[Outro]
<Fade out logic>
`;

// ─────────────────────────────────────────────────────────────
// 3. HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/** Generate a Visual Prompt for Video AI (Runway/Pika) */
export const generateVideoPrompt = async (songTitle: string, lyrics: string, style: string) => {
  try {
    const ai = getClient();
    const prompt = `
    Create a high-fidelity AI Video Generation Prompt (for Runway Gen-3/Pika) for a music video.
    
    Song Title: "${songTitle}"
    Musical Style: "${style}"
    Lyrics Snippet: "${lyrics.slice(0, 100)}..."
    
    Requirements:
    - Describe lighting, camera movement, color palette, and subject.
    - Keep it under 40 words.
    - Format: "Cinematic shot of [subject], [action], [lighting], [camera movement], [mood]."
    `;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Fast model is sufficient here
      contents: prompt,
    });
    return result.text?.trim() || null;
  } catch (error) {
    console.error("Video prompt generation failed", error);
    return null;
  }
};

/** Enhance Style */
export const enhanceStyle = async (draft: string) => {
  try {
    const ai = getClient();
    const prompt = `Refine this concept into a Suno v4.5 Style Prompt.
    Input: "${draft}"
    Output ONLY the style string (Genre, Instruments, Vibe, BPM, Key). No labels.`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    return result.text?.trim() ?? null;
  } catch (err) {
    console.error("Enhance failed", err);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────
// 4. MAIN GENERATOR
// ─────────────────────────────────────────────────────────────
export const generateContentResponse = async (
  prompt: string,
  mode: GeneratorMode,
  settings: StudioSettings,
  appSettings: AppSettings,
  isRadioEdit: boolean,
  hasIntro: boolean,
  lyricsLanguage: LyricsLanguage,
  history: { role: string; parts: { text: string }[] }[],
  signal?: AbortSignal
): Promise<GenerateContentResponse> => {
  
  const ai = getClient();
  let finalPrompt = prompt;
  let useSearch = false;

  // --- A. Mode Logic ---
  const modePrompts: Record<string, string> = {
    [GeneratorMode.RANDOM]:
      "Create a random commercially-strong hit in any coherent genre. Extremely catchy hooks.",
    [GeneratorMode.CRAZY]:
      "Create an experimental hybrid song combining incompatible genres (e.g., Opera + Dubstep).",
    [GeneratorMode.KPOP_RANDOM]:
      "Create a top-tier K-Pop track with strong English hooks.",
    [GeneratorMode.KPOP_3_VOICES]:
      "Create a K-Pop trio track. In 'Voice Description', list 3 distinct styles. In 'Lyrics', STRICTLY use tags like [Member A], [Member B].",
    [GeneratorMode.TRENDING]: (() => {
      useSearch = true;
      return "Search for current viral music trends (2024-2025). Write a hit song referencing the trend.";
    })(),
  };

  if (modePrompts[mode]) finalPrompt = modePrompts[mode];

  // --- B. Pro Settings Injection ---
  const { mood, vocal, structure } = settings;
  const moodDesc = [];
  
  // Mood Translation
  if (mood.darkBright < 30) moodDesc.push("Dark, Moody, Minor Key");
  else if (mood.darkBright > 70) moodDesc.push("Bright, Uplifting, Major Key");
  
  if (mood.cleanGritty < 30) moodDesc.push("Clean, Polished, High-Fidelity");
  else if (mood.cleanGritty > 70) moodDesc.push("Gritty, Lo-fi, Distorted, Saturated");

  if (mood.energy < 30) moodDesc.push("Chill, Laid-back, Ambient");
  else if (mood.energy > 70) moodDesc.push("High Energy, Hype, Aggressive, Banger");

  // Constraints
  const vocalInstruction = (vocal.gender !== 'Any' || vocal.texture !== 'Any') 
    ? `[CONSTRAINT: Voice must be ${vocal.texture !== 'Any' ? vocal.texture : ''} ${vocal.gender !== 'Any' ? vocal.gender : ''}]` 
    : "";

  const structureInstruction = structure !== 'Auto' 
    ? `[CONSTRAINT: Use strict ${structure} structure template]` 
    : "";

  // Language Logic
  const langConstraint =
    lyricsLanguage === LyricsLanguage.ARABIC
      ? "Write lyrics strictly in ARABIC (Egyptian/Gulf dialect). Style & Tags must remain ENGLISH."
      : lyricsLanguage === LyricsLanguage.MIXED
      ? "Write lyrics in mixed Arabic + English. Style & Tags remain ENGLISH."
      : "Write lyrics in English only.";

  // --- C. Assemble Final Prompt ---
  finalPrompt += `
  
  === STUDIO SETTINGS ===
  Tone: ${moodDesc.join(", ") || "Balanced"}
  ${vocalInstruction}
  ${structureInstruction}
  Language: ${langConstraint}
  ${hasIntro ? "Start with [Instrumental Intro]" : ""}
  ${isRadioEdit ? "Keep length under 3:00 (Radio Edit)" : ""}
  `;

  // --- D. Model Selection & Session ---
  // Using standard stable models. 'gemini-2.0-flash-exp' is great if you have access, otherwise 1.5-flash.
  const preferredModel = appSettings.generation.modelPreference === 'quality' 
    ? 'gemini-1.5-pro' 
    : 'gemini-1.5-flash';

  const createSession = (model: string, enableTools: boolean) => {
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: appSettings.generation.temperature,
    };
    if (enableTools) config.tools = [{ googleSearch: {} }];

    return ai.chats.create({ model, config, history });
  };

  try {
    const chat = createSession(preferredModel, useSearch);
    return await chat.sendMessage({ message: finalPrompt });
  } catch (err) {
    if (signal?.aborted) throw err;
    console.warn("⚠️ API Error or Rate Limit. Falling back to Flash.", err);
    // Fallback logic
    const chat = createSession("gemini-1.5-flash", false);
    return await chat.sendMessage({ message: finalPrompt });
  }
};

// ─────────────────────────────────────────────────────────────
// 5. PARSER (Robust Block Parsing)
// ─────────────────────────────────────────────────────────────
export const parseSongFromText = (text: string) => {
  if (!text) return null;

  // Helper to extract content between markers
  const extract = (startMarker: string, endMarker?: string): string => {
    const parts = text.split(startMarker);
    if (parts.length < 2) return "";
    const content = parts[1];
    return endMarker ? content.split(endMarker)[0].trim() : content.trim();
  };

  // 1. Parse META Block
  const metaSection = extract("--- BLOCK 1: META ---", "--- BLOCK 2");
  const title = metaSection.match(/\*\*Title:\*\*\s*(.+)/)?.[1]?.trim() || "Untitled";
  const rawVoice = metaSection.match(/\*\*Voice Description:\*\*\s*(.+)/)?.[1]?.trim();
  
  // 2. Parse STYLE Block
  const style = extract("--- BLOCK 2: STYLE PROMPT ---", "--- BLOCK 3");

  // 3. Parse LYRICS Block
  const lyrics = extract("--- BLOCK 3: LYRICS ---");

  if (!style && !lyrics) return null;

  // Generate Tags array from Style string
  const tags = style
    ? style.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    : [];

  return { 
    title, 
    voice: rawVoice || "Not specified", 
    style: style || "", 
    tags, 
    lyrics 
  };
};
