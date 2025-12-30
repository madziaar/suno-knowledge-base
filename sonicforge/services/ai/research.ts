
import { getClient } from "./client";
import { SAFETY_SETTINGS } from "./config";
import { GroundingChunk } from "../../types";

export const researchArtist = async (query: string): Promise<{ text: string, sources: GroundingChunk[] }> => {
  if (!query) return { text: '', sources: [] };
  
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze the sonic signature of: "${query}" for the purpose of recreating it in an AI Music Generator (Suno V4.5).
        
        Focus on extracting:
        - Production Techniques (Mixing, Effects, Era)
        - Key Instruments (Specific models if applicable)
        - Vocal Styles (Timbre, Processing)
        
        Strictly categorize your findings into these 4 Audio Engineering dimensions:
        1. PRODUCTION: Mixing style (e.g. "Wall of Sound", "Lo-fi", "Dry", "Wide Stereo"), Effects (e.g. "Gated Reverb", "Tape Saturation", "Autotune"), and Era (e.g. "Late 80s", "Modern Clean").
        2. INSTRUMENTS: Specific equipment. Don't say "Synths", say "Juno-106" or "Supersaws". Don't say "Drums", say "TR-808" or "Live Jazz Kit".
        3. VOCALS: Timbre (e.g. "Raspy", "Falsetto", "Breathy"), Processing (e.g. "Heavy Reverb", "Dry", "Distorted"), and Style.
        4. KEY GENRES: Specific subgenres (e.g. "Midwest Emo" instead of just "Rock").

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
  } catch (e: unknown) {
    console.warn("Research tool failed, attempting internal knowledge retrieval with fallback model", e);
    // Fallback: Ask Gemini without tools using internal knowledge
    // Use Flash-Lite as fallback to avoid hitting the same quota bucket/limit as Flash
    try {
        const fallbackResponse = await client.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: `Analyze the sonic signature of "${query}" based on your internal knowledge. Focus on Production, Instruments, and Vocals. Concise.`,
            config: {
                safetySettings: SAFETY_SETTINGS
            }
        });
        return { 
            text: (fallbackResponse.text || "No internal data found.") + "\n[Source: Internal Neural Knowledge Base (Lite)]", 
            sources: [] 
        };
    } catch (fallbackError: unknown) {
        return { text: "Research uplink failed completely. Improvising based on context...", sources: [] };
    }
  }
};
