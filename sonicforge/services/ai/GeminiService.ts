
import { GoogleGenAI, GenerateContentResponse, Type, Schema } from "@google/genai";
import { getClient } from "./client";
import { SAFETY_SETTINGS, EXPERT_SYSTEM_PROMPT, getSystemInstruction } from "./config";
import { validateAndFixTags, sanitizeLyrics } from "./validators";
import { GeneratedPrompt, ExpertInputs, SongConcept, IntentProfile } from "../../types";
import { GENERATE_SUNO_PROMPT, GENERATE_EXPERT_PROMPT, getFewShotExamples, REFINE_PROMPT_TASK } from "./prompts";
import { runResearchAgent } from "./agents";
import { parseJsonAsync } from "../../lib/json-repair";
import { classifyIntent } from "./classifier";
import { StyleComponents } from "../../features/generator/utils/styleBuilder";

export interface AgentContext {
  id: string;
  userInput: SongConcept;
  expertInputs: ExpertInputs;
  intentProfile: IntentProfile;
  researchData: { text: string; sources: any[] };
  generatedDraft: GeneratedPrompt | null;
}

export class GeminiService {
  private context: AgentContext;
  private isOverclockedMode: boolean = false;
  private lang: 'en' | 'pl' = 'en';

  constructor() {
    this.context = {
      id: '',
      userInput: {} as SongConcept,
      expertInputs: {} as ExpertInputs,
      intentProfile: { tone: 'neutral', complexity: 'moderate', needsResearch: false },
      researchData: { text: '', sources: [] },
      generatedDraft: null
    };
  }

  public initialize(inputs: SongConcept, expertInputs: ExpertInputs, isOverclockedMode: boolean, lang: 'en' | 'pl' = 'en'): void {
    this.isOverclockedMode = isOverclockedMode;
    this.lang = lang;
    this.context = {
      id: crypto.randomUUID(),
      userInput: inputs,
      expertInputs,
      intentProfile: { tone: 'neutral', complexity: 'moderate', needsResearch: false },
      researchData: { text: '', sources: [] },
      generatedDraft: null
    };
  }

  public async gatherIntelligence(useGoogleSearch: boolean): Promise<{ text: string; sources: any[] }> {
    const { intent, artistReference } = this.context.userInput;
    const classifierPromise = classifyIntent(`${intent} ${artistReference}`);
    const shouldResearch = useGoogleSearch || !!artistReference;
    const researchPromise = shouldResearch 
      ? runResearchAgent(intent, artistReference, useGoogleSearch)
      : Promise.resolve({ text: '', sources: [] });

    const [profile, research] = await Promise.all([classifierPromise, researchPromise]);
    this.context.intentProfile = profile;
    this.context.researchData = research;
    return research;
  }

  /**
   * THE ARTIST AGENT
   * Generates high-fidelity prompts using Gemini 3 Pro's Thinking Logic.
   */
  public async generate(isExpertMode: boolean, lyricSource: 'ai' | 'user', structuredStyle?: StyleComponents): Promise<GeneratedPrompt> {
    const { userInput, expertInputs, researchData, intentProfile } = this.context;
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        analysis: { type: Type.STRING, description: "Detailed thought process and production plan." },
        title: { type: Type.STRING, description: "Creative song title." },
        tags: { type: Type.STRING, description: "Strict 400 char limit, comma separated tags." },
        style: { type: Type.STRING, description: "Strict 400 char limit, descriptive prose." },
        lyrics: { type: Type.STRING, description: "Song lyrics with v4.5 structural tags." }
      },
      required: ["analysis", "title", "tags", "style", "lyrics"]
    };

    const systemInstruction = getSystemInstruction(
        this.isOverclockedMode, 
        userInput.intent, 
        intentProfile, 
        userInput.negativePrompt, 
        expertInputs.customPersona, 
        this.lang, 
        userInput.lyricsLanguage, 
        userInput.producerPersona, 
        userInput.useReMi
    ) + (isExpertMode ? "\n" + EXPERT_SYSTEM_PROMPT : "");

    const prompt = isExpertMode 
      ? GENERATE_EXPERT_PROMPT(userInput.intent, userInput.mood, userInput.instruments, researchData.text, expertInputs, "", userInput.lyricsLanguage, this.isOverclockedMode)
      : GENERATE_SUNO_PROMPT(userInput.intent, userInput.mood, userInput.instruments, researchData.text, userInput.mode, lyricSource === 'user' ? userInput.lyricsInput : undefined, getFewShotExamples(userInput.intent), userInput.lyricsLanguage, undefined, this.isOverclockedMode, undefined, userInput.useReMi);

    const client = getClient();
    
    // Using Gemini 3 Pro for complex reasoning and v4.5 architecture
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction,
        safetySettings: SAFETY_SETTINGS,
        // Engage maximum thinking budget for professional-grade architectural planning
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const json = await parseJsonAsync(response.text || "{}") as GeneratedPrompt;
    json.tags = validateAndFixTags(json.tags);
    json.lyrics = sanitizeLyrics(json.lyrics);
    json.modelUsed = 'Gemini 3 Pro // Neural Architect';
    
    return json;
  }

  public async refine(previousResult: GeneratedPrompt, instruction: string, targetLanguage: 'en' | 'pl' = 'en', lyricsLanguage?: string): Promise<GeneratedPrompt> {
    const prompt = REFINE_PROMPT_TASK(JSON.stringify(previousResult), instruction, lyricsLanguage);
    const systemInstruction = getSystemInstruction(this.isOverclockedMode, instruction, undefined, undefined, undefined, targetLanguage, lyricsLanguage);
    
    const client = getClient();
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction,
        safetySettings: SAFETY_SETTINGS,
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });

    return await parseJsonAsync(response.text || "{}");
  }

  public async optimizeDraft(currentDraft: Partial<ExpertInputs & SongConcept>): Promise<Partial<ExpertInputs & SongConcept>> {
    const client = getClient();
    const prompt = `
      TASK: Optimize the following music project draft for Suno V4.5+.
      DRAFT: ${JSON.stringify(currentDraft)}
      
      PROTOCOLS:
      1. GENRE ANCHORING: Ensure Genre is specific and front-loaded.
      2. GENDER GUARD: Explicitly state Male/Female/Duet in the vocal style.
      3. REPETITION HACK: Use optimized lowercase instrumental tags like [sax][saxophone][solo].
      4. BPM ALIGNMENT: Ensure BPM is appropriate for the chosen genre.
      5. TECHNICAL POLISH: Add high-fidelity production terms.

      OUTPUT: JSON matching the input draft structure with optimized values.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: getSystemInstruction(this.isOverclockedMode, "Optimize music prompt architecture", undefined, undefined, undefined, this.lang, currentDraft.lyricsLanguage),
        safetySettings: SAFETY_SETTINGS,
        thinkingConfig: { thinkingBudget: 8192 }
      }
    });

    return await parseJsonAsync(response.text || "{}");
  }
}
