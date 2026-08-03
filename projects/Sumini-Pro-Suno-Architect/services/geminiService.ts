// SUMINI v8 — Enhanced Suno-Optimized Prompt Engine
// Production-grade | Strong Constraints | Better Suno Compliance

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratorMode, LyricsLanguage, StudioSettings, AppSettings } from "../types";

/* =========================
   Dynamic Client Factory
========================= */
const getClient = (): GoogleGenAI => {
  let envKey = '';
  try {
    if (typeof process !== 'undefined' && process.env) {
      envKey = process.env.API_KEY;
    }
  } catch {}

  const apiKey = envKey || localStorage.getItem('sumini_api_key') || '';

  if (!apiKey) {
    console.warn("⚠️ No API Key found.");
  }

  return new GoogleGenAI({ apiKey });
};

/* =========================
   SYSTEM INSTRUCTION — v8
========================= */
export const SYSTEM_INSTRUCTION = `
You are **SUMINI v8**, an elite AI Music Architect optimized for Suno v4.5+.

Your mission:
Generate production-ready music blueprints with strict structural discipline and maximum Suno compatibility.

────────────────────────────────────────
🔥 CRITICAL OUTPUT RULES (NON-NEGOTIABLE)

1. BPM & Musical Key MUST appear inside ## Tags.
   - Missing BPM or Key = INVALID OUTPUT.

2. Section labels MUST use brackets only.
   - Example: [Verse], [Chorus], [Bridge]

3. Singer switching MUST use bracketed tags ONLY.
   - Correct: [Verse 1: Member A]
   - FORBIDDEN: "Member A:" in plain text (will be sung).

4. Chorus repetitions MUST include lyrical or melodic variation
   unless explicitly requested to repeat verbatim.

5. Style field MUST NOT exceed 18 comma-separated tokens.

────────────────────────────────────────
🎼 STRUCTURE ENGINE

- Pop:
  [Intro][Verse 1][Pre-Chorus][Chorus][Verse 2][Chorus][Bridge][Chorus][Outro]

- EDM:
  [Intro][Build][Drop][Breakdown][Build][Drop 2][Outro]

- Mahraganat:
  [Intro][Chant][Verse A][Drop][Verse B][Chant][Outro]

- Linear:
  [Intro][Texture A][Evolution][Texture B][Finale]

If structure conflicts with genre norms:
Adapt minimally while preserving section labels.

────────────────────────────────────────
🎛 STYLE (AUDIO DNA — NOT EMOTIONS)

Use technical sonic descriptors ONLY.
Examples:
Analog warmth, Tape saturation, Dry vocals,
Wide stereo image, Plate reverb, Sidechain compression

Reference styles allowed:
"Style of 80s Synthpop", "Style of Modern Trap"

────────────────────────────────────────
🎤 VOCAL PROFILING

Define vocals ONLY inside ## Voice section.
Examples:
- Male, Gritty Baritone
- Member A: Smooth Tenor | Member B: Deep Rap Bass
- Effects: Vocoder, Robot, Choir Stack

────────────────────────────────────────
✍️ LYRICS ARCHITECTURE

- Use bracketed section tags only.
- Use (parentheses) for ad-libs / backing vocals.
- Line breaks indicate rhythmic flow.

────────────────────────────────────────
📦 STRICT OUTPUT FORMAT

## Title: <Song Name>

## Voice:
<Full vocal description>

## Tags:
<#BPM, #Key, #Genre, #SubGenre, #Vibe, #Instruments>

## Style:
<Comma-separated technical audio tags>

## Lyrics:
<Lyrics with strict structure>
`;

/* =========================
   Video Prompt Generator
========================= */
export const generateVideoPrompt = async (
  songTitle: string,
  lyrics: string,
  style: string
) => {
  try {
    const ai = getClient();
    const prompt = `
Create a cinematic AI video prompt (Runway Gen-3 / Pika).

Song: "${songTitle}"
Style: "${style}"
Lyrics snippet: "${lyrics.slice(0, 100)}..."

Format:
"Cinematic shot of [subject], [action], [lighting], [camera movement], [mood]."

Max 40 words.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return result.text?.trim() || null;
  } catch (err) {
    console.error("Video prompt failed", err);
    return null;
  }
};

/* =========================
   Style Enhancer
========================= */
export const enhanceStyle = async (draft: string) => {
  try {
    const ai = getClient();
    const prompt = `
Refine this into a Suno v4.5 Style Prompt.

Input: "${draft}"

Output ONLY:
Genre, Instruments, Vibe, BPM, Key
(No labels, no explanations)
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return result.text?.trim() ?? null;
  } catch (err) {
    console.error("Style enhance failed", err);
    throw err;
  }
};

/* =========================
   Main Generator
========================= */
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

  /* ---------- Mode Logic ---------- */
  const modePrompts = {
    [GeneratorMode.RANDOM]:
      "Create a commercially strong hit with an unforgettable hook.",
    [GeneratorMode.CRAZY]:
      "Fuse incompatible genres into an experimental but coherent track.",
    [GeneratorMode.KPOP_RANDOM]:
      "Create a top-tier K-Pop song with strong English hooks.",
    [GeneratorMode.KPOP_3_VOICES]:
      "Create a K-Pop trio. Use strict bracketed singer tags.",
    [GeneratorMode.TRENDING]: (() => {
      useSearch = true;
      return "Search current 2024–2025 viral music trends and write a hit.";
    })(),
    [GeneratorMode.THINKING]:
      "Compose a complex, layered musical masterpiece.",
  };

  if (modePrompts[mode]) {
    finalPrompt = mode === GeneratorMode.THINKING && prompt.trim()
      ? prompt
      : modePrompts[mode];
  }

  /* ---------- Mood Translation ---------- */
  const { mood, vocal, structure } = settings;
  const moodDesc: string[] = [];

  if (mood.darkBright < 30) moodDesc.push("Dark, Minor Key");
  else if (mood.darkBright > 70) moodDesc.push("Bright, Major Key");

  if (mood.cleanGritty > 70) moodDesc.push("Gritty, Saturated, Lo-fi");
  else if (mood.cleanGritty < 30) moodDesc.push("Clean, Polished");

  if (mood.energy > 70) {
    moodDesc.push(
      structure.includes("EDM")
        ? "Festival Energy, Big Drops"
        : "High Energy, Aggressive Groove"
    );
  } else if (mood.energy < 30) {
    moodDesc.push("Chill, Ambient, Low Energy");
  }

  /* ---------- Constraints ---------- */
  const vocalConstraint =
    vocal.gender !== 'Any' || vocal.texture !== 'Any'
      ? `[CONSTRAINT: Voice must be ${vocal.texture} ${vocal.gender}]`
      : "";

  const structureConstraint =
    structure !== 'Auto'
      ? `[CONSTRAINT: Use strict ${structure} structure]`
      : "";

  const langConstraint =
    lyricsLanguage === LyricsLanguage.ARABIC
      ? "Lyrics strictly in ARABIC (Egyptian/Gulf). Style & Tags in ENGLISH."
      : lyricsLanguage === LyricsLanguage.MIXED
      ? "Lyrics in Arabic + English mix. Style & Tags in ENGLISH."
      : "Lyrics in ENGLISH only.";

  /* ---------- Final Prompt ---------- */
  finalPrompt += `
=== STUDIO SETTINGS ===
Tone: ${moodDesc.join(", ") || "Balanced"}
${vocalConstraint}
${structureConstraint}
Language: ${langConstraint}
${hasIntro ? "Include [Instrumental Intro]" : ""}
${isRadioEdit ? "Keep under 3 minutes (Radio Edit)" : ""}

[CRITICAL OUTPUT RULE]
BPM and Musical Key MUST appear inside ## Tags.
`;

  /* ---------- Model Selection ---------- */
  let modelName =
    appSettings.generation.modelPreference === 'quality'
      ? 'gemini-3-pro-preview'
      : 'gemini-2.5-flash';

  if (mode === GeneratorMode.THINKING) {
    modelName = 'gemini-3-pro-preview';
  }

  const createSession = (model: string, enableTools: boolean) => {
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: appSettings.generation.temperature,
    };

    if (mode === GeneratorMode.THINKING) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    if (enableTools) config.tools = [{ googleSearch: {} }];

    return ai.chats.create({ model, config, history });
  };

  try {
    const chat = createSession(modelName, useSearch);
    return await chat.sendMessage({ message: finalPrompt });
  } catch (err) {
    if (signal?.aborted) throw err;
    console.warn("⚠️ Fallback to flash model", err);
    const chat = createSession("gemini-2.5-flash", false);
    return await chat.sendMessage({ message: finalPrompt });
  }
};

/* =========================
   Parser (Improved)
========================= */
export const parseSongFromText = (text: string) => {
  const title = text.match(/## Title:\s*(.+)/)?.[1]?.trim();

  const voice =
    text.match(/## Voice:\s*([\s\S]*?)(?=## Tags:)/)?.[1]?.trim() ??
    "Not specified";

  const rawTags =
    text.match(/## Tags:\s*([\s\S]*?)(?=## Style:)/)?.[1]?.trim();

  const style =
    text.match(/## Style:\s*([\s\S]*?)(?=## Lyrics:)/)?.[1]?.trim();

  const lyrics =
    text.match(/## Lyrics:\s*([\s\S]*)/)?.[1]?.trim();

  if (!title || !style || !lyrics) return null;

  const tags = rawTags
    ?.replace(/\n/g, ",")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean) ?? [];

  return { title, voice, style, tags, lyrics };
};
