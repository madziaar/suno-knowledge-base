
import OpenAI from "openai";
import { SAFETY_SETTINGS, EXPERT_SYSTEM_PROMPT, getSystemInstruction } from "./config";
import { parseError, retryWithBackoff, globalCircuitBreaker } from "./utils";
import { validateAndFixTags, sanitizeLyrics } from "./validators";
import { GeneratedPrompt, ExpertInputs, SongConcept, AgentType } from "../../types";
import { GENERATE_SUNO_PROMPT, GENERATE_EXPERT_PROMPT, getFewShotExamples, REFINE_PROMPT_TASK, GENERATE_ALCHEMY_PROMPT } from "./prompts";
import { runCriticAgent, runRefinerAgent, runResearchAgent } from "./agents";
import { repairJsonAsync, parseJsonAsync } from "../../lib/json-repair";
import { classifyIntent, IntentProfile } from "./classifier";
import { assembleStylePrompt, enhanceFromDatabase, StyleComponents } from "../../features/generator/utils/styleBuilder";
import { IGeneratorService, AgentContext } from "./types";

interface AlchemyContext {
    workflow: 'forge' | 'alchemy';
    mode: 'vocals' | 'instrumental' | 'inspire' | 'cover';
    playlistUrl?: string;
}

// Helper for token estimation
const estimateTokenCount = (text: string) => Math.ceil(text.length / 4);

/**
 * The primary service class for interacting with NVIDIA NIM AI.
 * Handles the full lifecycle of prompt generation using NVIDIA NIM endpoints.
 * Implements the IGeneratorService interface.
 */
export class NimService implements IGeneratorService {
  private context: AgentContext;
  private isPyriteMode: boolean = false;
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.NVIDIA_API_KEY || process.env.NIM_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: NVIDIA_API_KEY or NIM_API_KEY is missing from environment variables.");
      throw new Error("Configuration Error: NVIDIA API Key missing.");
    }
    
    this.client = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey
    });
    
    // Initialize with empty defaults to satisfy TS, real init happens in initialize()
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

  /**
   * Initializes the service context with user inputs.
   * Must be called before `gatherIntelligence` or `generate`.
   * 
   * @param inputs - Basic user inputs (Intent, Mood, etc.)
   * @param expertInputs - Advanced configuration (Structure, BPM, Era)
   * @param isPyriteMode - Whether the Chaos Engine (Pyrite) is active
   */
  public initialize(inputs: SongConcept, expertInputs: ExpertInputs, isPyriteMode: boolean): void {
    this.isPyriteMode = isPyriteMode;
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

  /**
   * Phase 1: Intelligence Gathering.
   * Runs Intent Classification and Web Research in parallel.
   * Populates `context.intentProfile` and `context.researchData`.
   * 
   * @param useGoogleSearch - Force external research if true.
   * @returns The research results and grounding sources.
   */
  public async gatherIntelligence(useGoogleSearch: boolean): Promise<{ text: string; sources: any[] }> {
    const { intent, artistReference } = this.context.userInput;
    
    // Parallel Execution: Classification + Research
    const classifierPromise = classifyIntent(`${intent} ${artistReference}`);
    
    const shouldResearch = useGoogleSearch || !!artistReference;
    const researchPromise = shouldResearch 
      ? runResearchAgent(intent, artistReference, useGoogleSearch)
      : Promise.resolve({ text: '', sources: [] });

    const [profile, research] = await Promise.all([classifierPromise, researchPromise]);

    this.context.intentProfile = profile;
    this.context.researchData = research;
    this.context.history.push(`[INTEL]: Classified as ${profile.tone}/${profile.complexity}. Research found ${research.sources.length} sources.`);

    return research;
  }

  /**
   * Phase 2: Generation.
   * Executes the main generation pipeline using NVIDIA NIM models.
   * Automatically handles model cascading, error recovery, and optional Agentic Refinement loops.
   * 
   * @param isExpertMode - If true, uses the detailed Structure Builder logic.
   * @param lyricSource - 'ai' to write new lyrics, 'user' to restructure existing ones.
   * @param structuredStyle - Optional pre-constructed style object (e.g. from Studio mode).
   * @param onStreamUpdate - Optional callback for streaming partial JSON updates.
   * @param onAgentChange - Optional callback to notify UI of active agent state (Critic, Refiner).
   * @param forcedStructure - NEW: Automated Studio Logic to inject structure into Standard Mode.
   * @returns The fully generated and validated prompt object.
   */
  public async generate(
    isExpertMode: boolean,
    lyricSource: 'ai' | 'user',
    structuredStyle?: StyleComponents,
    onStreamUpdate?: (partial: GeneratedPrompt) => void,
    onAgentChange?: (agent: AgentType) => void,
    forcedStructure?: string
  ): Promise<GeneratedPrompt> {
    const { userInput, expertInputs, researchData, intentProfile } = this.context;
    const { negativePrompt, lyricsLanguage } = userInput;

    let draft: GeneratedPrompt;

    if (isExpertMode) {
      draft = await this.generateExpert(
        expertInputs,
        userInput.intent,
        userInput.mood,
        researchData.text,
        intentProfile,
        negativePrompt,
        onAgentChange,
        structuredStyle,
        lyricsLanguage
      );
    } else {
      const alchemyContext: AlchemyContext | undefined = userInput.workflow === 'alchemy' ? {
        workflow: 'alchemy',
        mode: userInput.alchemyMode,
        playlistUrl: userInput.playlistUrl
      } : undefined;

      draft = await this.generateStandard(
        `${userInput.intent}. Mood: ${userInput.mood}. Instruments: ${userInput.instruments}`,
        researchData.text,
        userInput.mode,
        lyricSource === 'user' ? userInput.lyricsInput : undefined,
        onStreamUpdate,
        intentProfile,
        negativePrompt,
        onAgentChange,
        structuredStyle,
        alchemyContext,
        userInput.targetLanguage, // Pass generic language pref
        lyricsLanguage, // Pass explicit lyrics lang
        forcedStructure // Pass down automated structure
      );
    }

    this.context.generatedDraft = draft;
    this.context.history.push(`[GEN]: Draft created via ${draft.modelUsed}`);
    return draft;
  }

  /**
   * Refines an existing result based on natural language instruction.
   * Uses NVIDIA NIM with high thinking budget for complex edits.
   * 
   * @param previousResult - The prompt object to modify.
   * @param instruction - The user's request (e.g. "Make it faster", "Rewrite verse 2").
   * @param targetLanguage - UI language context.
   * @param lyricsLanguage - Target language for lyrics generation.
   * @returns The modified prompt object.
   */
  public async refine(
    previousResult: GeneratedPrompt,
    instruction: string,
    targetLanguage: 'en' | 'pl' = 'en',
    lyricsLanguage?: string
  ): Promise<GeneratedPrompt> {
    const previousJson = JSON.stringify(previousResult, null, 2);
    const prompt = REFINE_PROMPT_TASK(previousJson, instruction, lyricsLanguage);

    const systemInstruction = getSystemInstruction(this.isPyriteMode, instruction, undefined, undefined, undefined, targetLanguage, lyricsLanguage);

    try {
      let json = await this.executeCascade(prompt, systemInstruction, 4096);
      
      if (json.tags) json.tags = validateAndFixTags(json.tags);
      if (json.lyrics) json.lyrics = sanitizeLyrics(json.lyrics);

      return json;
    } catch (error: unknown) {
      throw new Error(parseError(error));
    }
  }

  // --- PRIVATE GENERATION METHODS ---

  private async generateExpert(
    inputs: ExpertInputs,
    userInput: string,
    mood: string,
    researchData: string,
    profile?: IntentProfile,
    negativePrompt?: string,
    onAgentChange?: (agent: AgentType) => void,
    structuredStyle?: StyleComponents,
    lyricsLanguage?: string
  ): Promise<GeneratedPrompt> {
    if (!inputs.structure || inputs.structure.length === 0) {
      throw new Error("Expert Mode Error: No song structure defined. Add sections to continue.");
    }

    let targetStyleString = '';
    if (structuredStyle) {
      targetStyleString = assembleStylePrompt(structuredStyle);
    } else {
      targetStyleString = assembleStylePrompt({
        genres: [inputs.genre],
        subGenres: [],
        moods: [mood],
        bpm: inputs.bpm,
        key: inputs.key,
        era: inputs.era,
        vocals: [],
        vocalStyle: inputs.vocalStyle,
        instruments: (inputs.instrumentStyle || '').split(',').map(s=>s.trim()).filter(Boolean),
        atmosphere: (inputs.atmosphereStyle || '').split(',').map(s=>s.trim()).filter(Boolean),
        production: (inputs.techAnchor || '').split(',').map(s=>s.trim()).filter(Boolean),
        influences: []
      });
    }

    const structureInstructions = inputs.structure.map(s => {
      const mods = s.modifiers.length > 0 ? ` | ${s.modifiers.join(' | ')}` : '';
      const isInst = s.modifiers.includes('Instrumental') || s.type === 'Instrumental' || (s.type === 'Intro' && s.modifiers.includes('Instrumental'));
      return `   - Section: [${s.type}${mods}]${isInst ? ' -> FORCE SILENCE / INSTRUMENTAL' : ''}`;
    }).join('\n');

    const prompt = GENERATE_EXPERT_PROMPT(userInput, researchData, inputs, structureInstructions, mood, lyricsLanguage, this.isPyriteMode) + 
                   `\n\n**CRITICAL STYLE DIRECTIVE**: The 'style' field output MUST strictly follow this pre-calculated structure:\n"${targetStyleString}, [AI Added Details]"`;

    const context = `${inputs.genre} ${mood} ${userInput}`;
    const targetLanguage = 'en'; 
    
    const systemInstruction = getSystemInstruction(this.isPyriteMode, context, profile, negativePrompt, inputs.customPersona, targetLanguage as any, lyricsLanguage) + "\n" + EXPERT_SYSTEM_PROMPT;

    try {
      if (onAgentChange) onAgentChange('generator');
      let json = await this.executeCascade(prompt, systemInstruction, 8192, undefined, profile?.complexity);
      
      if (json.tags) json.tags = validateAndFixTags(json.tags);
      if (json.lyrics) json.lyrics = sanitizeLyrics(json.lyrics);

      json = await this.executeAgenticLoop(json, onAgentChange);

      const validationWarnings = this.validateExpertOutput(json);
      if (validationWarnings.length > 0 && json.analysis) {
        json.analysis += `\n\n[VALIDATION REPORT]:\n${validationWarnings.join('\n')}`;
      }

      return json;
    } catch (e: unknown) {
      console.error("Expert Generation Failed", e);
      throw new Error(parseError(e));
    }
  }

  private async generateStandard(
    intent: string,
    researchData: string,
    mode: 'custom' | 'general' | 'instrumental' | 'easy',
    existingLyrics?: string,
    onStreamUpdate?: (partial: GeneratedPrompt) => void,
    profile?: IntentProfile,
    negativePrompt?: string,
    onAgentChange?: (agent: AgentType) => void,
    structuredStyle?: StyleComponents,
    alchemyContext?: AlchemyContext,
    targetLanguage: 'en' | 'pl' = 'en',
    lyricsLanguage?: string,
    forcedStructure?: string // NEW
  ): Promise<GeneratedPrompt> {
    const contextKey = `${intent} ${mode}`;
    const examples = getFewShotExamples(contextKey);

    let finalIntent = intent;
    if (structuredStyle) {
      if (structuredStyle.genres.length > 0) {
        const enhancement = enhanceFromDatabase(structuredStyle.genres[0]);
        if (enhancement.instruments) structuredStyle.instruments.push(...enhancement.instruments);
        if (enhancement.production) structuredStyle.production.push(...enhancement.production);
      }
      const targetStyle = assembleStylePrompt(structuredStyle);
      finalIntent += `\n\nTARGET STYLE STRING: "${targetStyle}..." (Expand on this)`;
    }

    let prompt = '';
    if (alchemyContext && alchemyContext.workflow === 'alchemy') {
      prompt = GENERATE_ALCHEMY_PROMPT(alchemyContext.mode, finalIntent, researchData, alchemyContext.playlistUrl, lyricsLanguage, this.isPyriteMode);
    } else {
      prompt = GENERATE_SUNO_PROMPT(finalIntent, researchData, mode, existingLyrics, examples, lyricsLanguage, forcedStructure, this.isPyriteMode);
    }

    const systemInstruction = getSystemInstruction(this.isPyriteMode, intent, profile, negativePrompt, undefined, targetLanguage, lyricsLanguage);
    
    let maxTokens = 4096; 
    if (mode === 'instrumental') maxTokens = 2048;
    if (profile?.complexity === 'complex') maxTokens = 8192;

    try {
      if (onAgentChange) onAgentChange('generator');
      let json = await this.executeCascade(prompt, systemInstruction, maxTokens, onStreamUpdate, profile?.complexity);
      
      if (json.tags) json.tags = validateAndFixTags(json.tags);
      if (json.lyrics) json.lyrics = sanitizeLyrics(json.lyrics);

      json = await this.executeAgenticLoop(json, onAgentChange);

      return json;
    } catch (error: unknown) {
      throw new Error(parseError(error));
    }
  }

  private async executeAgenticLoop(
    initialDraft: GeneratedPrompt, 
    onAgentChange?: (agent: AgentType) => void
  ): Promise<GeneratedPrompt> {
    try {
      return await globalCircuitBreaker.execute(async () => {
        if (onAgentChange) onAgentChange('critic');
        const critique = await runCriticAgent(initialDraft);
        
        if (critique.pass) {
          if (onAgentChange) onAgentChange('idle');
          return initialDraft;
        }
        
        console.log(`[Agentic Loop] Critic found issues:`, critique.issues);
        if (onAgentChange) onAgentChange('refiner');
        const refined = await runRefinerAgent(initialDraft, critique.issues);
        
        if (onAgentChange) onAgentChange('idle');
        return refined;
      });
    } catch (e: unknown) {
      console.warn("Agentic Loop bypassed due to circuit breaker/error.", e);
      if (onAgentChange) onAgentChange('idle');
      return initialDraft;
    }
  }

  private async executeCascade(
    promptContent: string,
    systemInstruction: string,
    maxTokens: number,
    onStreamUpdate?: (partial: GeneratedPrompt) => void,
    complexity?: 'simple' | 'moderate' | 'complex'
  ): Promise<GeneratedPrompt> {
    let result: GeneratedPrompt;
    
    let effectiveMaxTokens = Math.max(maxTokens, 2048); 
    if (complexity === 'simple') effectiveMaxTokens = 2048;
    if (complexity === 'moderate') effectiveMaxTokens = 4096;
    if (complexity === 'complex') effectiveMaxTokens = 8192;

    const estimatedInputTokens = estimateTokenCount(promptContent + systemInstruction);
    const useLiteFallbackImmediately = estimatedInputTokens > 30000;

    try {
      if (useLiteFallbackImmediately) throw new Error("Skipping Tier 1");

      // TIER 1: NVIDIA Llama 3.1 405B Instruct (Most capable)
      await retryWithBackoff(async () => {
        const response = await this.client.chat.completions.create({
          model: 'meta/llama-3.1-405b-instruct',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: promptContent }
          ],
          temperature: 0.7,
          max_tokens: effectiveMaxTokens,
          response_format: { type: 'json_object' }
        });

        const fullText = response.choices[0]?.message?.content || '';
        result = await parseJsonAsync(fullText || "{}") as GeneratedPrompt;
        result.modelUsed = "NVIDIA Llama 3.1 405B Instruct";
      }, 2, 500);

    } catch (tier1Error: unknown) {
      console.warn("Tier 1 (Llama 405B) Failed. Cascading to Tier 2...", tier1Error);
      
      // TIER 2: NVIDIA Llama 3.1 70B Instruct
      try {
        await retryWithBackoff(async () => {
          const response = await this.client.chat.completions.create({
            model: 'meta/llama-3.1-70b-instruct',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: promptContent }
            ],
            temperature: 0.7,
            max_tokens: effectiveMaxTokens,
            response_format: { type: 'json_object' }
          });
          result = await parseJsonAsync(response.choices[0]?.message?.content || "{}") as GeneratedPrompt;
          result.modelUsed = "NVIDIA Llama 3.1 70B Instruct";
        }, 2, 500);
        
        if (result!.analysis) result!.analysis += "\n\n[SYSTEM NOTE: Primary model overloaded/failed. Generated via Backup (70B).]";

      } catch (tier2Error: unknown) {
        console.warn("Tier 2 (70B) Failed. Cascading to Tier 3...", tier2Error);

        // TIER 3: NVIDIA Llama 3.1 8B Instruct (Fast fallback)
        try {
          result = await globalCircuitBreaker.execute(async () => {
            const response = await this.client.chat.completions.create({
              model: 'meta/llama-3.1-8b-instruct',
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: promptContent }
              ],
              temperature: 0.7,
              max_tokens: effectiveMaxTokens,
              response_format: { type: 'json_object' }
            });
            const r = await parseJsonAsync(response.choices[0]?.message?.content || "{}") as GeneratedPrompt;
            r.modelUsed = "NVIDIA Llama 3.1 8B Instruct";
            return r;
          });
          
          if (result!.analysis) result!.analysis += "\n\n[SYSTEM NOTE: Emergency Fallback Protocol (8B).]";

        } catch (tier3Error: unknown) {
          throw new Error(`ALL TIERS FAILED. Last error: ${parseError(tier3Error)}`);
        }
      }
    }

    return result!;
  }

  private validateExpertOutput(prompt: GeneratedPrompt): string[] {
    const warnings: string[] = [];
    const lyrics = prompt.lyrics || '';
    const hasPipeOperators = /\[[^\]]+\|[^\]]+\]/.test(lyrics);
    if (!hasPipeOperators) {
      warnings.push("WARNING: Pipe operators (|) not detected. Suno v5 prefers [Section | Mod] format.");
    }
    if (/\((intro|verse|chorus|bridge|outro|instrumental)\)/i.test(lyrics)) {
      warnings.push("CRITICAL: Structural tag found in parentheses. AI will sing this. Use [Brackets].");
    }
    return warnings;
  }
}
