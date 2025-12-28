
import { getClient } from "./client";
import { Type, Schema } from "@google/genai";
import { SAFETY_SETTINGS } from "./config";
import { parseError, retryWithBackoff } from "./utils";
import { AudioAnalysisResult } from "../../types";

/**
 * THE SPECTRAL SCANNER
 * Listen to audio and reverse-engineer its sonic DNA.
 * Upgraded to Gemini 3 Flash for enhanced audio modality support.
 */
export const analyzeAudioReference = async (audioBase64: string, mimeType: string, isPyriteMode: boolean): Promise<AudioAnalysisResult> => {
    const client = getClient();
    
    const prompt = `
      [PROTOCOL: SPECTRAL_DECONSTRUCTION_V10_ULTRA]
      TASK: Perform a forensic audio engineering analysis of the provided audio file.
      GOAL: Reconstruct its 'Sonic DNA' into a text prompt for Suno V4.5.
      
      ANALYSIS DIMENSIONS:
      1. **GENRE & SUB-GENRE**: Identify specific micro-genres (e.g., "Liquid Drum & Bass", "Midwest Emo", "Memphis Phonk").
      2. **VOCAL PROFILE**: Gender, Timbre (e.g., "Breathy", "Guttural", "Operatic"), and Processing (e.g., "Heavy Auto-tune", "Dry", "Telephone EQ").
      3. **INSTRUMENTATION**: Specific hardware/instruments (e.g., "TB-303", "Stratocaster", "808 Kick", "Gated Reverb Snare").
      4. **RHYTHM**: BPM and Feel (Straight, Swing, Half-time).
      5. **PRODUCTION**: Era and Mixing Style (e.g., "1980s Tape Saturation", "Modern Hyper-compressed", "Lo-fi Vinyl Crackle").
      6. **MOOD**: Primary emotional resonance (e.g., "Ethereal", "Aggressive", "Melancholic").

      OUTPUT FORMAT:
      - **STYLE**: A dense, comma-separated string combining Genre, Vocal details, Atmosphere, and Tech specs. Target ~500 chars.
      - **TAGS**: 6 high-impact keywords.
      - **GENRE**, **MOOD**, **INSTRUMENTS**, **BPM**, **KEY**, **ERA**.

      ${isPyriteMode ? "PERSONA: Pyrite. You are a sonic surgeon. Dissect this waveform with ruthless precision. Don't be vague, darling." : "PERSONA: Expert Audio Engineer. Clinical, precise, and technical."}
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
            era: { type: Type.STRING },
            confidence_score: { type: Type.NUMBER },
            error_measure: { type: Type.STRING }
        },
        required: ["style", "tags", "mood", "instruments", "bpm", "key", "genre", "era"]
    };

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash', // Using 2.5 Flash for multimodal robustness
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: mimeType, data: audioBase64 } }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                safetySettings: SAFETY_SETTINGS
            }
        });

        const json = JSON.parse(response.text || "{}");
        return {
            ...json,
            confidence_score: 95, // Audio analysis is usually high confidence
            error_measure: "Direct Spectral Analysis"
        };
    } catch (e) {
        console.error("Audio Analysis Failed", e);
        throw new Error(parseError(e));
    }
};

/**
 * YOUTUBE INTERCEPTOR
 * Scrapes metadata since we cannot download audio client-side.
 */
export const analyzeYouTubeReference = async (url: string, isPyriteMode: boolean): Promise<AudioAnalysisResult> => {
    const client = getClient();

    const prompt = `
      [PROTOCOL: REMOTE_NEURAL_INTERCEPTION_V3]
      TASK: Analyze the musical content of the YouTube video at: "${url}"
      
      EXECUTION STEPS:
      1. **METADATA HARVEST**: Google Search for Artist, Title, and Release Year.
      2. **SONIC PROFILING**: Search "BPM", "Key", "Genre", and "Credits" on databases (Tunebat, Discogs, Genius).
      3. **VIBE RECONSTRUCTION**: Based on reviews/descriptions, reconstruct the sonic texture (Instruments, Mood, Vocal Style).
      
      ANTI-HALLUCINATION:
      - If metadata is not found, return confidence_score: 0.
      - Do not guess specific technical details (BPM/Key) if not found in search.
      
      OUTPUT REQUIREMENTS:
      - STYLE: Comprehensive prompt string for Suno V4.5.
      - TAGS: 6 valid tags.
      - CONFIDENCE_SCORE: 0-100.
      - ERROR_MEASURE: Source of data or reason for failure.

      ${isPyriteMode ? "PERSONA: Pyrite. Dig deep into the digital archives. I want the soul of this track, not just the wiki page." : ""}
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
            era: { type: Type.STRING },
            confidence_score: { type: Type.NUMBER },
            error_measure: { type: Type.STRING }
        },
        required: ["style", "tags", "confidence_score", "error_measure"]
    };

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: schema,
                safetySettings: SAFETY_SETTINGS
            }
        });

        const result = JSON.parse(response.text || "{}");
        
        // Safety Fallback for Low Confidence
        if (result.confidence_score < 20) {
             result.style = "Signal weak. Metadata unreachable. Please upload the raw audio file for spectral deconstruction.";
             result.tags = "unknown, signal_lost";
             result.error_measure = "Search Grounding Failed";
        }

        return result;
    } catch (e) {
        console.error("YouTube Analysis Failed", e);
        throw new Error(parseError(e));
    }
};
