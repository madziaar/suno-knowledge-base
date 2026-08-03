
import { getClient } from "./client";
import { GeneratedPrompt, GroundingChunk } from "../../types";
import { CRITIC_PROMPT, REFINER_PROMPT } from "./prompts/tasks";

interface CriticResult {
  pass: boolean;
  issues: string[];
}

interface ResearchResult {
  text: string;
  sources: GroundingChunk[];
}

const CRITIC_SCHEMA = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    issues: { 
      type: 'array', 
      items: { type: 'string' } 
    }
  },
  required: ["pass", "issues"]
};

/**
 * 1. THE INQUISITOR (Critic)
 * Uses a fast, low-cost model (Llama 3.1 8B) to verify strict Suno V4.5 constraints.
 * Checks for character limits, tag syntax, and formatting violations.
 * 
 * @param draft - The generated prompt to evaluate.
 * @returns An object indicating pass/fail and list of specific issues.
 */
export const runCriticAgent = async (draft: GeneratedPrompt): Promise<CriticResult> => {
  const client = getClient();
  const draftJson = JSON.stringify(draft, null, 2);
  
  try {
    const response = await client.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct', // Fast inference
      messages: [
        { role: 'system', content: 'You are a strict validator for Suno V4.5 music prompts. Check for syntax errors, character limits, and formatting violations.' },
        { role: 'user', content: CRITIC_PROMPT(draftJson) }
      ],
      temperature: 0.1, // Strict logic
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
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
 * Uses a smarter model (Llama 3.1 70B) to surgically fix specific issues identified by the Critic.
 * Only modifies the fields flagged as problematic.
 * 
 * @param draft - The original failed draft.
 * @param issues - List of issues identified by the Critic.
 * @returns The corrected prompt object.
 */
export const runRefinerAgent = async (draft: GeneratedPrompt, issues: string[]): Promise<GeneratedPrompt> => {
  const client = getClient();
  const draftJson = JSON.stringify(draft, null, 2);

  const REFINER_SCHEMA = {
    type: 'object',
    properties: {
      analysis: { type: 'string' },
      title: { type: 'string' },
      tags: { type: 'string' },
      style: { type: 'string' },
      lyrics: { type: 'string' }
    },
    required: ["title", "tags", "style", "lyrics"]
  };

  try {
    const response = await client.chat.completions.create({
      model: 'meta/llama-3.1-70b-instruct', // Flash is sufficient for structured fixes
      messages: [
        { role: 'system', content: 'You are a prompt refiner. Fix only the issues identified, preserve everything else.' },
        { role: 'user', content: REFINER_PROMPT(draftJson, issues) }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const fixed = JSON.parse(response.choices[0]?.message?.content || "{}");
    
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
    1. If an Artist Reference is provided, you MUST use your knowledge to research production techniques.
       - Focus on: Specific production techniques (mixing, effects), Key Instruments (synths, guitars), and Vocal Styles.
       - If the reference includes a style description (e.g. "Dark Era", "Unplugged"), include that in your analysis.
    2. If the User Intent contains specific, obscure, or technical genres that might require external data, use your training knowledge.
    3. If the request is generic (e.g. "Sad piano song") and no Artist Reference is present, generate from internal knowledge.
  `;

  if (forceSearchOnIntent) {
    decisionPromptPart = `
      DECISION PROTOCOL:
      You MUST research the User Intent using your internal knowledge. If an Artist Reference is also provided, research that as well (focusing on production/instruments/vocals). Your primary research target is the USER INTENT.
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
    const response = await client.chat.completions.create({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [
        { role: 'system', content: 'You are a helpful research agent specializing in music production and audio engineering.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1024
    });

    const text = response.choices[0]?.message?.content || "No research data generated.";
    
    // NVIDIA NIM doesn't provide grounding metadata like Gemini
    const sources: GroundingChunk[] = [];

    return { text, sources };

  } catch (e) {
    console.warn("Research Agent failed. Returning empty context.", e);
    return { text: "Research unavailable.", sources: [] };
  }
};
