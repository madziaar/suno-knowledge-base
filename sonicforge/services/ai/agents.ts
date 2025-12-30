
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
 * 
 * @param draft - The generated prompt to evaluate.
 * @returns An object indicating pass/fail and list of specific issues.
 */
export const runCriticAgent = async (draft: GeneratedPrompt): Promise<CriticResult> => {
  const client = getClient();
  const draftJson = JSON.stringify(draft, null, 2);
  
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash', // Fast inference
      contents: CRITIC_PROMPT(draftJson),
      config: {
        responseMimeType: "application/json",
        responseSchema: CRITIC_SCHEMA,
        temperature: 0.1, // Strict logic
        safetySettings: SAFETY_SETTINGS
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      pass: result.pass ?? true, // Default to pass if parsing fails to avoid blocking
      issues: result.issues ?? []
    };
  } catch (e) {
    console.warn("Critic Agent failed to execute. Bypassing QA.", e);
    return { pass: true, issues: [] };
  }
};

/**
 * 2. THE REFINER
 * Uses a smarter model (Flash) to surgically fix specific issues identified by the Critic.
 * Only modifies the fields flagged as problematic.
 * 
 * @param draft - The original failed draft.
 * @param issues - List of issues identified by the Critic.
 * @returns The corrected prompt object.
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
      model: 'gemini-2.5-flash', // Flash is sufficient for structured fixes
      contents: REFINER_PROMPT(draftJson, issues),
      config: {
        responseMimeType: "application/json",
        responseSchema: REFINER_SCHEMA,
        temperature: 0.2,
        safetySettings: SAFETY_SETTINGS
      }
    });

    const fixed = JSON.parse(response.text || "{}");
    
    // Merge fixed fields with original (preserve analysis if lost)
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
 * Decides whether to use external tools (Google Search) or internal knowledge base
 * based on the complexity of the user's request.
 * 
 * @param intent - The user's prompt description.
 * @param artistRef - Specific artist reference (triggers mandatory search).
 * @param forceSearchOnIntent - Manually override heuristic to force search.
 * @returns Research summary text and source citations.
 */
export const runResearchAgent = async (intent: string, artistRef: string, forceSearchOnIntent: boolean = false): Promise<ResearchResult> => {
  const client = getClient();
  const hasRef = artistRef && artistRef.trim().length > 0;
  
  // If no inputs, skip
  if (!intent?.trim() && !hasRef) return { text: '', sources: [] };

  let decisionPromptPart = `
    DECISION PROTOCOL:
    1. If an Artist Reference is provided, you MUST use the 'googleSearch' tool.
       - Focus search on: Specific production techniques (mixing, effects), Key Instruments (synths, guitars), and Vocal Styles.
       - If the reference includes a style description (e.g. "Dark Era", "Unplugged"), include that in your search query.
    2. If the User Intent contains specific, obscure, or technical genres that might require external data, use 'googleSearch'.
    3. If the request is generic (e.g. "Sad piano song") and no Artist Reference is present, DO NOT use the tool. Just generate the report from internal knowledge.
  `;

  if (forceSearchOnIntent) {
    decisionPromptPart = `
      DECISION PROTOCOL:
      You MUST use the 'googleSearch' tool to research the User Intent. If an Artist Reference is also provided, research that as well (focusing on production/instruments/vocals). Your primary research target is the USER INTENT.
    `;
  }

  const prompt = `
    ROLE: You are an expert musicologist and audio engineer assistant.
    TASK: Provide technical research data for a song generation AI.
    
    INPUTS:
    - USER INTENT: "${intent || 'General Song'}"
    - ARTIST REFERENCE: "${hasRef ? artistRef : "None"}"

    ${decisionPromptPart}

    RESEARCH TARGETS (Prioritize these details):
    1. PRODUCTION: Mixing style (e.g. Wall of Sound, Lo-fi, Wide Stereo), Effects (Gated Reverb, Distortion), and specific Era production traits.
    2. INSTRUMENTS: Specific gear if possible (Juno-106, TR-808, Stratocaster) or general instrumentation characteristics.
    3. VOCALS: Delivery style (Falsetto, Fry, Belting), processing (Autotune, Vocoder), and gender/timbre.

    OUTPUT FORMAT (Strict Text):
    Categorize into: [PRODUCTION], [INSTRUMENTS], [VOCALS], [KEY GENRES].
    Keep it dense, technical, and concise. No conversational filler.
  `;

  try {
    // We use a non-streaming call to allow tool use
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Tool is available
        systemInstruction: "You are a helpful research agent. Use tools only if necessary to add VALUE.",
        safetySettings: SAFETY_SETTINGS
      }
    });

    const text = response.text || "No research data generated.";
    
    // Extract sources if tool was used
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingChunk[] = chunks.map(chunk => ({
      web: chunk.web ? {
        uri: chunk.web.uri || '',
        title: chunk.web.title || ''
      } : undefined
    })).filter(s => s.web?.uri);

    return { text, sources };

  } catch (e) {
    console.warn("Research Agent failed. Returning empty context.", e);
    return { text: "Research unavailable.", sources: [] };
  }
};
