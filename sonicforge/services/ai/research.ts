import { getClient } from "./client";
import { SAFETY_SETTINGS } from "./config";
import { GroundingChunk } from "../../types";
import { retryWithBackoff } from "./utils";

export const researchArtist = async (query: string): Promise<{ text: string, sources: GroundingChunk[] }> => {
  if (!query) return { text: '', sources: [] };
  
  const client = getClient();
  try {
    const researchResult = await retryWithBackoff(async () => {
        // Fix: Changed model to gemini-3-flash-preview as recommended for text tasks with search
        const response = await client.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `
            Analyze the sonic signature of: "${query}" for the purpose of recreating it in an AI Music Generator (Suno V4.5).
            
            Focus on extracting:
            - Production Techniques (Mixing, Effects, Era)
            - Key Instruments (Specific models if applicable)
            - Vocal Styles (Timbre, Processing)
            
            Strictly categorize your findings into these 4 Audio Engineering dimensions:
            1. PRODUCTION: Mixing style, Effects, and Era.
            2. INSTRUMENTS: Specific equipment.
            3. VOCALS: Timbre, Processing, and Style.
            4. KEY GENRES: Specific subgenres.

            Keep it concise and dense. No fluff.
          `,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: "You are an expert Audio Engineer and Musicologist. You ignore biographical data and focus purely on SONIC TEXTURE, TIMBRE, and MIXING.",
            safetySettings: SAFETY_SETTINGS
          }
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const validChunks: GroundingChunk[] = chunks.map(chunk => ({
          web: chunk.web ? {
            uri: chunk.web.uri || '',
            title: chunk.web.title || ''
          } : undefined
        }));

        return {
          text: response.text || "No research data found.",
          sources: validChunks
        };
    }, 2, 800);

    return researchResult;
  } catch (e: unknown) {
    console.warn("Research agent failed after retries, attempting internal knowledge fallback", e);
    try {
        const fallbackResponse = await retryWithBackoff(async () => {
            return await client.models.generateContent({
                model: 'gemini-flash-lite-latest',
                contents: `Analyze the sonic signature of "${query}" based on your internal knowledge. Focus on Production, Instruments, and Vocals. Concise.`,
                config: { safetySettings: SAFETY_SETTINGS }
            });
        }, 1, 500);

        return { 
            text: (fallbackResponse.text || "No internal data found.") + "\n[Source: Internal Neural Knowledge Base]", 
            sources: [] 
        };
    } catch (fallbackError: unknown) {
        return { text: "Research uplink unreachable. Using heuristic context...", sources: [] };
    }
  }
};