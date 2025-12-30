
import { getClient } from "./client";
import { Type, Schema } from "@google/genai";
import { SAFETY_SETTINGS } from "./config";

export interface IntentProfile {
  tone: 'aggressive' | 'melancholic' | 'uplifting' | 'technical' | 'chaotic' | 'neutral';
  complexity: 'simple' | 'moderate' | 'complex';
  needsResearch: boolean;
  detectedGenre?: string;
}

const CLASSIFIER_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    tone: { type: Type.STRING, enum: ['aggressive', 'melancholic', 'uplifting', 'technical', 'chaotic', 'neutral'] },
    complexity: { type: Type.STRING, enum: ['simple', 'moderate', 'complex'] },
    needsResearch: { type: Type.BOOLEAN },
    detectedGenre: { type: Type.STRING }
  },
  required: ["tone", "complexity", "needsResearch"]
};

/**
 * Rapidly classifies user intent using Gemini 2.5 Flash-Lite.
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
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite', // Fastest model for metadata
      contents: `Classify this music generation prompt. Input: "${userInput}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: CLASSIFIER_SCHEMA,
        temperature: 0.1,
        maxOutputTokens: 100,
        safetySettings: SAFETY_SETTINGS
      }
    });

    return JSON.parse(response.text || "{}") as IntentProfile;
  } catch (e: unknown) {
    console.warn("Intent classification failed, using defaults.", e);
    return { tone: 'neutral', complexity: 'moderate', needsResearch: false };
  }
};
