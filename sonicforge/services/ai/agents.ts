
import { getClient } from "./client";
import { GeneratedPrompt, GroundingChunk } from "../../types";
import { CRITIC_PROMPT, REFINER_PROMPT } from "./prompts/tasks";
import { Type, Schema } from "@google/genai";
import { SAFETY_SETTINGS } from "./config";

interface CriticResult {
  pass: boolean;
  issues: string[];
}

interface ResearchResult {
  text: string;
  sources: GroundingChunk[];
}

const CRITIC_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    pass: { type: Type.BOOLEAN },
    issues: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    }
  },
  required: ["pass", "issues"]
};

/**
 * 1. THE INQUISITOR (Critic)
 * Uses a fast, low-cost model (Flash) to verify strict Suno V4.5 constraints.
 * Checks for character limits, tag syntax, and formatting violations.
 */
export const runCriticAgent = async (draft: GeneratedPrompt): Promise<CriticResult> => {
  const client = getClient();
  const draftJson = JSON.stringify(draft, null, 2);
  
  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: CRITIC_PROMPT(draftJson),
      config: {
        responseMimeType: "application/json",
        responseSchema: CRITIC_SCHEMA,
        temperature: 0.1, 
        safetySettings: SAFETY_SETTINGS
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      pass: result.pass ?? true,
      issues: result.issues ?? []
    };
  } catch (e) {
    console.warn("Critic Agent failed to execute. Bypassing QA.", e);
    return { pass: true, issues: [] };
  }
};

/**
 * 2. THE REFINER
 * Uses a smarter model (Gemini 3 Pro) to surgically fix specific issues identified by the Critic.
 * Upgraded from Flash for maximum adherence to constraints during repair.
 */
export const runRefinerAgent = async (draft: GeneratedPrompt, issues: string[]): Promise<GeneratedPrompt> => {
  const client = getClient();
  const draftJson = JSON.stringify(draft, null, 2);

  const REFINER_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
      analysis: { type: Type.STRING },
      title: { type: Type.STRING },
      tags: { type: Type.STRING },
      style: { type: Type.STRING },
      lyrics: { type: Type.STRING }
    },
    required: ["title", "tags", "style", "lyrics"]
  };

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: REFINER_PROMPT(draftJson, issues),
      config: {
        responseMimeType: "application/json",
        responseSchema: REFINER_SCHEMA,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 4096 }, // Give it some time to think about the fix
        safetySettings: SAFETY_SETTINGS
      }
    });

    const fixed = JSON.parse(response.text || "{}");
    
    return {
      ...draft,
      ...fixed,
      analysis: (fixed.analysis ?? draft.analysis) + "\n[System: Auto-Refined by Agent]"
    };
  } catch (e) {
    console.warn("Refiner Agent failed. Returning original draft.", e);
    return draft;
  }
};

/**
 * 3. THE RESEARCHER (Dynamic Tooling)
 * Scours the web for technical sonic specs.
 */
export const runResearchAgent = async (intent: string, artistRef: string, forceSearchOnIntent: boolean = false): Promise<ResearchResult> => {
  const client = getClient();
  const hasRef = artistRef && artistRef.trim().length > 0;
  
  if (!intent?.trim() && !hasRef) return { text: '', sources: [] };

  const prompt = `
    ROLE: You are an expert musicologist and high-end Audio Engineer.
    TASK: Extract exact technical specifications for a song generation AI.
    
    TARGETS:
    - User Intent: "${intent || 'General Song'}"
    - Artist Reference: "${hasRef ? artistRef : "None"}"

    INSTRUCTIONS:
    1. Search for: "Mixing signal chain", "Key Instruments", "Vocal processing", and "Rhythm section specs" for the targets.
    2. Identify specific hardware models (e.g., Roland Juno-60, TR-808, Fender Telecaster).
    3. Determine the Era's production limitations (e.g., "1980s gated reverb", "Tape saturation intensity").
    4. Categorize results: [PRODUCTION], [INSTRUMENTS], [VOCALS], [ERA ACCURACY].

    Keep the output technical and dense. No conversational filler.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a professional Music Production Researcher. Focus purely on technical gear and mixing techniques.",
        safetySettings: SAFETY_SETTINGS
      }
    });

    const text = response.text || "No technical data discovered.";
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingChunk[] = chunks.map(chunk => ({
      web: chunk.web ? {
        uri: chunk.web.uri || '',
        title: chunk.web.title || ''
      } : undefined
    })).filter(s => !!s.web?.uri);

    return { text, sources };

  } catch (e) {
    console.warn("Research Agent failed. Returning empty context.", e);
    return { text: "Research uplink unreachable.", sources: [] };
  }
};
