// Enhanced Suno-Optimized Prompt Engine (Refined SYSTEM_INSTRUCTION & prompt logic)
// Cleaned, stronger guidance, tighter structure, higher consistency.

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratorMode, LyricsLanguage, StudioSettings, AppSettings } from "../types";

// Dynamic Client Factory
// Uses safe environment check to prevent "process is not defined" crash in browsers
const getClient = (): GoogleGenAI => {
  let envKey = '';
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      envKey = process.env.API_KEY;
    }
  } catch (e) {
    // Ignore reference errors if process is not defined
  }
  
  const apiKey = envKey || localStorage.getItem('sumini_api_key') || '';
  
  if (!apiKey) {
    console.warn("No API Key found in Env or LocalStorage.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * ULTRA-REFINED **SYSTEM INSTRUCTION**
 * v7 — Optimized for "Pro Suno Architect" with Enhanced Auto-Tagging
 */
export const SYSTEM_INSTRUCTION = `
You are **SUMINI v7**, the elite AI Music Architect designed specifically for Suno v4.5.
Your goal: Generate high-fidelity, production-ready music blueprints that maximize audio quality and structural coherence.

────────────────────────────────────────
🔥 CORE ENGINE: STRUCTURAL METADATA
Every output must start with a precision-engineered header block.

1. **BPM & KEY**: You MUST assign a specific BPM and Musical Key suitable for the genre.
   - Example: Deep House → #124 BPM, #A Minor
   - Example: Phonk → #170 BPM, #C# Minor

2. **STRUCTURE**: Adhere to the requested structure logic exactly.
   - **Pop**: [Intro] [Verse 1] [Pre-Chorus] [Chorus] [Verse 2] [Chorus] [Bridge] [Chorus] [Outro]
   - **EDM**: [Intro] [Build] [Drop] [Breakdown] [Build] [Drop 2] [Outro]
   - **Mahraganat**: [Intro] [Chant] [Verse A] [Drop] [Verse B] [Chant] [Outro]
   - **Linear**: [Intro] [Texture A] [Evolution] [Texture B] [Finale]

────────────────────────────────────────
🎛 STYLE PROMPT ENGINEERING (AUDIO DNA)
The **Style** field is for the AUDIO ENGINE, not the human.
- **DO NOT** use emotion words (sad, happy) alone. Use Sonic Descriptors.
- **USE**: "Analog warmth", "Tape saturation", "Wide stereo width", "Dry vocals", "Plate reverb".

**Vibe Keywords:**
- *Dark*: "Bitcrushed, Lo-fi, Minor key, Distorted 808s"
- *Bright*: "Polished, Sparkling highs, Major key, Acoustic resonance"
- *Chill*: "Laid-back groove, Minimalist, Ambient pads, Soft transients"
- *Hype*: "Aggressive compression, Hard clipping, Wall of sound, Fast attack"

────────────────────────────────────────
🎤 VOCAL PROFILING
Define the voice strictly in the "## Voice:" section.
- Single: "Male, Gritty Rock Tenor"
- Multi: "Member A: Smooth Tenor. Member B: Deep Bass Rapper."
- Effects: "Robot, Vocoder, Monotone, Choir"

────────────────────────────────────────
✍️ LYRICAL ARCHITECTURE
- **Metatags**: Use [Verse], [Chorus], [Bridge], [Drop], [Instrumental Break].
- **Voice Switching**: IMPORTANT! When switching singers (e.g. Duets/Trios), use bracketed tags ONLY: [Verse 1: Member A] or [Member B]. NEVER write "Member A:" without brackets or the AI will sing the name.
- **Flow**: Use (parentheses) for ad-libs and backing vocals.
- **Rhythm**: Break lines to indicate flow.

────────────────────────────────────────
📦 OUTPUT FORMAT (STRICT)

## Title: <Song Name>

## Voice:
<Full vocal description. For groups, list all members here.>

## Tags:
<#BPM, #Key, #Genre, #SubGenre, #Vibe, #Instruments>

## Style:
<Comma-separated technical audio tags. Genre, Vibe, Instruments, Mixing Style>

## Lyrics:
<Lyrics with [Sections] and (Ad-libs)>
`;

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
      model: "gemini-2.5-flash",
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
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return result.text?.trim() ?? null;
  } catch (err) {
    console.error("Enhance failed", err);
    throw err; // Propagate to App.tsx for handling
  }
};

/** Main Non-Streaming Generator */
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
  
  // Initialize Dynamic Client
  const ai = getClient();

  let finalPrompt = prompt;
  let useSearch = false;

  // 1. Mode Logic
  const modePrompts = {
    [GeneratorMode.RANDOM]:
      "Create a random commercially-strong hit in any coherent genre. Extremely catchy hooks.",
    [GeneratorMode.CRAZY]:
      "Create an experimental hybrid song combining incompatible genres.",
    [GeneratorMode.KPOP_RANDOM]:
      "Create a top-tier K-Pop track with strong English hooks.",
    [GeneratorMode.KPOP_3_VOICES]:
      "Create a K-Pop trio track. In the '## Voice' section, explicitly list distinct vocal styles for [Member A], [Member B], and [Member C]. In '## Lyrics', STRICTLY use bracketed tags like [Member A], [Member B] to indicate singer changes. DO NOT include singer names as plain text.",
    [GeneratorMode.TRENDING]: (() => {
      useSearch = true;
      return "Search for current viral trends (2024-2025). Write a hit song referencing the trend.";
    })(),
  };

  if (modePrompts[mode]) finalPrompt = modePrompts[mode];

  // 2. Pro Settings Injection (The "Engine")
  const { mood, vocal, structure } = settings;
  
  // Mood Translation
  const moodDesc = [];
  if (mood.darkBright < 30) moodDesc.push("Dark, Moody, Minor Key");
  else if (mood.darkBright > 70) moodDesc.push("Bright, Uplifting, Major Key");
  
  if (mood.cleanGritty < 30) moodDesc.push("Clean, Polished, High-Fidelity");
  else if (mood.cleanGritty > 70) moodDesc.push("Gritty, Lo-fi, Distorted, Saturated");

  if (mood.energy < 30) moodDesc.push("Chill, Laid-back, Low Energy, Ambient");
  else if (mood.energy > 70) moodDesc.push("High Energy, Hype, Aggressive, Banger");

  // Vocal Translation
  let vocalInstruction = "";
  if (vocal.gender !== 'Any' || vocal.texture !== 'Any') {
    vocalInstruction = `[CONSTRAINT: Voice must be ${vocal.texture !== 'Any' ? vocal.texture : ''} ${vocal.gender !== 'Any' ? vocal.gender : ''}]`;
  }

  // Structure Translation
  let structureInstruction = "";
  if (structure !== 'Auto') {
    structureInstruction = `[CONSTRAINT: Use strict ${structure} structure template]`;
  }

  // Language
  const langConstraint =
    lyricsLanguage === LyricsLanguage.ARABIC
      ? "Write lyrics strictly in ARABIC (Egyptian/Gulf dialect). Style & Tags must remain ENGLISH."
      : lyricsLanguage === LyricsLanguage.MIXED
      ? "Write lyrics in mixed Arabic + English. Style & Tags remain ENGLISH."
      : "Write lyrics in English only.";

  // 3. Assemble Final Prompt
  finalPrompt += `\n\n=== STUDIO SETTINGS ===
  Tone: ${moodDesc.join(", ") || "Balanced"}
  ${vocalInstruction}
  ${structureInstruction}
  Language: ${langConstraint}
  ${hasIntro ? "Include [Instrumental Intro]" : ""}
  ${isRadioEdit ? "Keep under 3 mins (Radio Edit)" : ""}
  `;

  // Determine Model
  const modelName = appSettings.generation.modelPreference === 'quality' 
    ? 'gemini-3-pro-preview' 
    : 'gemini-2.5-flash';

  // Chat session
  const createSession = (model: string, enableTools: boolean) => {
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: appSettings.generation.temperature, // Use user preference
    };
    if (enableTools) config.tools = [{ googleSearch: {} }];

    return ai.chats.create({ model, config, history });
  };

  try {
    const chat = createSession(modelName, useSearch);
    return await chat.sendMessage({ message: finalPrompt });
  } catch (err) {
    if (signal?.aborted) throw err;
    console.warn("Fallback to flash", err);
    const chat = createSession("gemini-2.5-flash", false);
    return await chat.sendMessage({ message: finalPrompt });
  }
};

/** Parser */
export const parseSongFromText = (text: string) => {
  const title = text.match(/## Title:\s*(.+)/)?.[1]?.trim();
  // Robust multi-line capture for Voice
  const voice = text.match(/## Voice:\s*([\s\S]*?)(?=## Tags:)/)?.[1]?.trim() ?? "Not specified";
  // Robust multi-line capture for Tags
  const rawTags = text.match(/## Tags:\s*([\s\S]*?)(?=## Style:)/)?.[1]?.trim();
  // Robust multi-line capture for Style
  const style = text.match(/## Style:\s*([\s\S]*?)(?=## Lyrics:)/)?.[1]?.trim();
  // Remaining content is Lyrics
  const lyrics = text.match(/## Lyrics:\s*([\s\S]*)/)?.[1]?.trim();

  if (!title || !style || !lyrics) return null;

  const tags = rawTags
    ? rawTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return { title, voice, style, tags, lyrics };
};
