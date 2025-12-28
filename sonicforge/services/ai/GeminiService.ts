
import { getClient } from "./client";
import { Type, Schema } from "@google/genai";
import { SAFETY_SETTINGS, EXPERT_SYSTEM_PROMPT, getSystemInstruction } from "./config";
import { validateAndFixTags, sanitizeLyrics } from "./validators";
import { GeneratedPrompt, ExpertInputs, SongConcept, IntentProfile } from "../../types";
import { GENERATE_SUNO_PROMPT, GENERATE_EXPERT_PROMPT, getFewShotExamples, REFINE_PROMPT_TASK } from "./prompts";
import { runResearchAgent } from "./agents";
import { parseJsonAsync } from "../../lib/json-repair";
import { classifyIntent } from "./classifier";
import { StyleComponents } from "../../features/generator/utils/styleBuilder";
import { IGeneratorService, AgentContext } from "./types";
import { retryWithBackoff, parseError } from "./utils";

export class GeminiService implements IGeneratorService {
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
      generatedDraft: null,
      history: []
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
      generatedDraft: null,
      history: []
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
        analysis: { type: Type.STRING },
        title: { type: Type.STRING },
        tags: { type: Type.STRING },
        style: { type: Type.STRING },
        lyrics: { type: Type.STRING }
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
    const response = await retryWithBackoff(async () => {
      return await client.models.generateContent({
        model: intentProfile.complexity === 'complex' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          systemInstruction,
          safetySettings: SAFETY_SETTINGS,
          thinkingConfig: { thinkingBudget: 4096 }
        }
      });
    });

    const json = await parseJsonAsync(response.text || "{}") as GeneratedPrompt;
    json.tags = validateAndFixTags(json.tags);
    json.lyrics = sanitizeLyrics(json.lyrics);
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
        safetySettings: SAFETY_SETTINGS
      }
    });

    return await parseJsonAsync(response.text || "{}");
  }
}
