
import { getClient } from "./client";
import { SAFETY_SETTINGS } from "./config";
import { GroundingChunk } from "../../types";

export const researchArtist = async (query: string): Promise<{ text: string, sources: GroundingChunk[] }> => {
  if (!query) return { text: '', sources: [] };
  
  const client = getClient();
  try {
    const response = await client.chat.completions.create({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [
        { role: 'system', content: 'You are an expert Audio Engineer and Musicologist. You ignore biographical data and focus purely on SONIC TEXTURE, TIMBRE, and MIXING.' },
        { role: 'user', content: `
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
        `}
      ],
      temperature: 0.5,
      max_tokens: 1024
    });

    // NVIDIA NIM doesn't provide grounding metadata like Gemini
    return {
      text: response.choices[0]?.message?.content || "No research data found.",
      sources: []
    };
  } catch (e: unknown) {
    console.warn("Research tool failed, attempting internal knowledge retrieval with fallback model", e);
    // Fallback: Use smaller model
    try {
        const fallbackResponse = await client.chat.completions.create({
            model: 'meta/llama-3.1-8b-instruct',
            messages: [
              { role: 'system', content: 'You are an expert Audio Engineer and Musicologist.' },
              { role: 'user', content: `Analyze the sonic signature of "${query}" based on your internal knowledge. Focus on Production, Instruments, and Vocals. Concise.`}
            ],
            temperature: 0.5,
            max_tokens: 512
        });
        return { 
            text: (fallbackResponse.choices[0]?.message?.content || "No internal data found.") + "\n[Source: Internal Neural Knowledge Base (Lite)]", 
            sources: [] 
        };
    } catch (fallbackError: unknown) {
        return { text: "Research uplink failed completely. Improvising based on context...", sources: [] };
    }
  }
};
