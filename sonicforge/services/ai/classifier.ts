
import OpenAI from "openai";
import { SAFETY_SETTINGS } from "./config";

export interface IntentProfile {
  tone: 'aggressive' | 'melancholic' | 'uplifting' | 'technical' | 'chaotic' | 'neutral';
  complexity: 'simple' | 'moderate' | 'complex';
  needsResearch: boolean;
  detectedGenre?: string;
}

const CLASSIFIER_SCHEMA = {
  type: 'object',
  properties: {
    tone: { type: 'string', enum: ['aggressive', 'melancholic', 'uplifting', 'technical', 'chaotic', 'neutral'] },
    complexity: { type: 'string', enum: ['simple', 'moderate', 'complex'] },
    needsResearch: { type: 'boolean' },
    detectedGenre: { type: 'string' }
  },
  required: ["tone", "complexity", "needsResearch"]
};

/**
 * Rapidly classifies user intent using NVIDIA Llama 3.1 8B Instruct.
 * This runs in parallel with research to configure the system prompt dynamically.
 * Determines thinking budget (via complexity) and tone modulation.
 * 
 * @param userInput - The raw user input string.
 * @returns An IntentProfile object.
 */
export const classifyIntent = async (userInput: string): Promise<IntentProfile> => {
  if (!userInput || userInput.length < 5) {
    return { tone: 'neutral', complexity: 'simple', needsResearch: false };
  }

  const client = getClient();
  
  try {
    const response = await client.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct', // Fast model for metadata
      messages: [
        { role: 'system', content: 'You are a music prompt classifier. Classify prompts by tone, complexity, and research needs.' },
        { role: 'user', content: `Classify this music generation prompt. Input: "${userInput}"` }
      ],
      temperature: 0.1,
      max_tokens: 100,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0]?.message?.content || "{}") as IntentProfile;
  } catch (e: unknown) {
    console.warn("Intent classification failed, using defaults.", e);
    return { tone: 'neutral', complexity: 'moderate', needsResearch: false };
  }
};
