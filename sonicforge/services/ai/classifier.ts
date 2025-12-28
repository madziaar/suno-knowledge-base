
import { getClient } from "./client";
import { Type, Schema } from "@google/genai";
import { SAFETY_SETTINGS } from "./config";
import { retryWithBackoff } from "./utils";
import { IntentProfile } from "../../types";

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
 * Determines thinking budget (via complexity) and tone modulation.
 */
export const classifyIntent = async (userInput: string): Promise<IntentProfile> => {
  if (!userInput || userInput.length < 5) {
    return { tone: 'neutral', complexity: 'simple', needsResearch: false };
  }

  const client = getClient();
  
  try {
    return await retryWithBackoff(async () => {
        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash-lite', 
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
    }, 2, 500); // 2 retries for classification
  } catch (e: unknown) {
    console.warn("Intent classification failed after retries, using defaults.", e);
    return { tone: 'neutral', complexity: 'moderate', needsResearch: false };
  }
};
