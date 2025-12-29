import { GoogleGenAI, Type, Schema } from "@google/genai";
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

  public async generate(isExpertMode: boolean, lyricSource: 'ai' | 'user', structuredStyle?: StyleComponents): Promise<GeneratedPrompt> {
    const { userInput, expertInputs, researchData, intentProfile } = this.context;
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        analysis: { type: Type.STRING, description: "Deep Reasoning Trace: 1. Sonic Anchor, 2. Narrative Arc, 3. Hardware Gear, 4. Signal Chain." },
        title: { type: Type.STRING, description: "Evocative song title." },
        tags: { type: Type.STRING, description: "Max 400 char technical keywords, comma separated." },
        style: { type: Type.STRING, description: "Max 400 char descriptive sound design spec." },
        lyrics: { type: Type.STRING, description: "V4.5 structured lyrics with brackets and melisma hyphens." }
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
      ? GENERATE_EXPERT_PROMPT(userInput.intent, userInput.mood, userInput.instruments, researchData.text, expertInputs, "", userInput.lyricsLanguage, this.isOverclockedMode, userInput.producerPersona)
      : GENERATE_SUNO_PROMPT(userInput.intent, userInput.mood, userInput.instruments, researchData.text, userInput.mode, lyricSource === 'user' ? userInput.lyricsInput : undefined, getFewShotExamples(userInput.intent), userInput.lyricsLanguage, undefined, this.isOverclockedMode, userInput.producerPersona, userInput.useReMi);

    const client = getClient();
    
    // ENGAGE GEMINI 3 PRO WITH MAXIMUM THINKING BUDGET (32k) FOR V5 DEEP REASONING
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction,
        safetySettings: SAFETY_SETTINGS,
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    });

    const json = await parseJsonAsync(response.text || "{}") as GeneratedPrompt;
    json.tags = validateAndFixTags(json.tags);
    json.lyrics = sanitizeLyrics(json.lyrics);
    json.modelUsed = 'Gemini 3 Pro // Obsidian Core v5.0';
    
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
      TASK: Optimize this music project draft for Suno V4.5+.
      DRAFT: ${JSON.stringify(currentDraft)}
      PROTOCOLS: 50-CHAR RULE, GENDER GUARD, REPETITION HACK, POWER ENDING.
      OUTPUT: Optimized JSON matching input schema.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: getSystemInstruction(this.isOverclockedMode, "Optimization", undefined, undefined, undefined, this.lang, currentDraft.lyricsLanguage),
        safetySettings: SAFETY_SETTINGS,
        thinkingConfig: { thinkingBudget: 8192 }
      }
    });

    return await parseJsonAsync(response.text || "{}");
  }
}