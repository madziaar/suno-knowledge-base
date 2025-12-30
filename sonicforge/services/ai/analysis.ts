
import { getClient } from "./client";
import { Type, Schema } from "@google/genai";
import { SAFETY_SETTINGS } from "./config";
import { parseError } from "./utils";
import { AudioAnalysisResult } from "../../types";

/**
 * Analyzes an audio file (MP3/WAV) using Gemini 2.5 Flash's multimodal capabilities.
 * Reverse-engineers the audio's sonic characteristics (BPM, Key, Instruments, etc.)
 * to populate the prompt generator.
 * 
 * @param audioBase64 - Base64 encoded audio data.
 * @param mimeType - MIME type of the audio file.
 * @param isPyriteMode - Adjusts analysis tone (technical vs vibe-based).
 * @returns Structured AudioAnalysisResult.
 */
export const analyzeAudioReference = async (audioBase64: string, mimeType: string, isPyriteMode: boolean): Promise<AudioAnalysisResult> => {
    const client = getClient();
    
    const prompt = `
      TASK: Listen to this audio file and reverse-engineer its sonic characteristics for use in a Suno V4.5 prompt.
      
      ANALYZE THE FOLLOWING:
      1. STYLE: Describe the mix, production, and vibe in detail (max 400 chars).
      2. TAGS: Comma-separated tags (Genre, Subgenre, Vocals, Instruments, Mood).
      3. MOOD: 1-2 words.
      4. INSTRUMENTS: List key instruments heard.
      5. BPM: Estimate the BPM.
      6. KEY: Estimate the musical key.
      7. GENRE: The primary genre.
      8. ERA: The era it sounds like (e.g. 1980s, Modern).

      ${isPyriteMode ? "MODE: PYRITE. Be sharp, critical, and extract the 'vibe' perfectly." : "MODE: STANDARD. Be technically precise."}
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            style: { type: Type.STRING },
            tags: { type: Type.STRING },
            mood: { type: Type.STRING },
            instruments: { type: Type.STRING },
            bpm: { type: Type.STRING },
            key: { type: Type.STRING },
            genre: { type: Type.STRING },
            era: { type: Type.STRING }
        },
        required: ["style", "tags", "mood", "instruments", "bpm", "key", "genre", "era"]
    };

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: audioBase64
                    }
                },
                { text: prompt }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                safetySettings: SAFETY_SETTINGS
            }
        });

        const json = JSON.parse(response.text || "{}");
        if (json.tags) json.tags = json.tags.toLowerCase();
        
        return json as AudioAnalysisResult;
    } catch (e: unknown) {
        throw new Error(parseError(e));
    }
};

/**
 * Transcribes lyrics from an audio file using Gemini 2.5 Flash Native Audio capabilities.
 * Intended for the "Add Instrumentals" or "Remix" workflows where the user provides vocals.
 * 
 * @param audioBase64 - Base64 encoded audio data.
 * @param mimeType - MIME type of the audio file.
 * @returns Transcribed text with basic structure tags.
 */
export const transcribeAudioLyrics = async (audioBase64: string, mimeType: string): Promise<string> => {
    const client = getClient();
    
    const prompt = `
      TASK: Listen to this audio file and transcribe the lyrics exactly as they are sung.
      
      INSTRUCTIONS:
      1. If there are vocals, output the lyrics.
      2. Format them with [Verse], [Chorus] tags if you can detect the structure.
      3. If it is purely instrumental, describe the structure using tags like [Intro], [Solo], [Drop].
      4. Do not add conversational text. Output ONLY the lyrics/structure.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: audioBase64
                    }
                },
                { text: prompt }
            ],
            config: {
                safetySettings: SAFETY_SETTINGS
            }
        });

        return response.text?.trim() || "";
    } catch (e: unknown) {
        throw new Error(parseError(e));
    }
};
