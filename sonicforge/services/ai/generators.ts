
import { getClient } from "./client";
import { Type, Schema } from "@google/genai";
import { SAFETY_SETTINGS, EXPERT_SYSTEM_PROMPT, getSystemInstruction } from "./config";
import { parseError, retryWithBackoff, globalCircuitBreaker } from "./utils";
import { validateAndFixTags, sanitizeLyrics } from "./validators";
import { GeneratedPrompt, ExpertInputs, AgentType } from "../../types";
import { GENERATE_SUNO_PROMPT, GENERATE_EXPERT_PROMPT, getFewShotExamples, REFINE_PROMPT_TASK, GENERATE_ALCHEMY_PROMPT } from "./prompts";
import { runCriticAgent, runRefinerAgent } from "./agents";
import { repairJsonAsync, parseJsonAsync } from "../../lib/json-repair";
import { IntentProfile } from "./classifier";
import { assembleStylePrompt, enhanceFromDatabase, StyleComponents } from "../../features/generator/utils/styleBuilder";

const validateExpertOutput = (prompt: GeneratedPrompt): string[] => {
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
};

const executeAgenticLoop = async (
    initialDraft: GeneratedPrompt, 
    onAgentChange?: (agent: AgentType) => void
): Promise<GeneratedPrompt> => {
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
};

// Heuristic for token counting (Client-side fast estimation)
const estimateTokenCount = (text: string) => Math.ceil(text.length / 4);

const executeGenerationCascade = async (
    promptContent: string,
    schema: Schema,
    systemInstruction: string,
    baseThinkingBudget: number,
    onStreamUpdate?: (partial: GeneratedPrompt) => void,
    complexity?: 'simple' | 'moderate' | 'complex'
): Promise<GeneratedPrompt> => {
    const client = getClient();
    let result: GeneratedPrompt;
    
    // Dynamic Budgeting based on input complexity
    // V4.5 demands deeper reasoning for structure and style ordering
    // UPGRADE: Maximize thinking budget for complex tasks to utilize Gemini 3 capabilities fully
    let effectiveBudget = Math.max(baseThinkingBudget, 16384); 
    
    if (complexity === 'simple') effectiveBudget = 8192; // Simple tasks
    if (complexity === 'moderate') effectiveBudget = 16384; // Standard
    if (complexity === 'complex') effectiveBudget = 32768; // Max out for complex logic (Gemini 3 Pro Max)

    // Check estimated prompt size
    const estimatedInputTokens = estimateTokenCount(promptContent + systemInstruction);
    const useLiteFallbackImmediately = estimatedInputTokens > 30000; // If prompt is massive, 3 Pro might error or be slow

    if (useLiteFallbackImmediately) {
         console.warn("Input too large, skipping to Lite model.");
    }

    // TIER 1: Gemini 3 Pro (Thinking)
    // Wrapped in Retry with Backoff
    try {
        if (useLiteFallbackImmediately) throw new Error("Skipping Tier 1");

        await retryWithBackoff(async () => {
            const streamResult = await client.models.generateContentStream({
                model: 'gemini-3-pro-preview',
                contents: promptContent,
                config: {
                    thinkingConfig: { thinkingBudget: effectiveBudget },
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    systemInstruction: systemInstruction,
                    safetySettings: SAFETY_SETTINGS
                }
            });

            let fullText = "";
            for await (const chunk of streamResult) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullText += chunkText;
                    if (onStreamUpdate) {
                        // Use Async Worker for Repair to keep UI responsive
                        const partial = await repairJsonAsync(fullText);
                        onStreamUpdate(partial);
                    }
                }
            }
            
            // Offload final parse to worker to avoid UI freeze
            result = await parseJsonAsync(fullText || "{}") as GeneratedPrompt;
            result.modelUsed = "Gemini 3 Pro (Thinking)";
        }, 2, 500); // 2 Retries, 500ms initial delay

    } catch (tier1Error: unknown) {
        console.warn("Tier 1 (Pro) Failed. Cascading to Tier 2...", tier1Error);
        
        // TIER 2: Gemini 2.5 Flash (Standard)
        try {
            await retryWithBackoff(async () => {
                const response = await client.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: promptContent,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        systemInstruction: systemInstruction,
                        safetySettings: SAFETY_SETTINGS
                    }
                });
                // Offload parse
                result = await parseJsonAsync(response.text || "{}") as GeneratedPrompt;
                result.modelUsed = "Gemini 2.5 Flash";
            }, 2, 500);
            
            if (result!.analysis) result!.analysis += "\n\n[SYSTEM NOTE: Pro model overloaded/failed. Generated via Backup (Flash).]";

        } catch (tier2Error: unknown) {
            console.warn("Tier 2 (Flash) Failed. Cascading to Tier 3...", tier2Error);

            // TIER 3: Gemini 2.5 Flash Lite (Emergency)
            // Use Circuit Breaker for the final safeguard
            try {
                result = await globalCircuitBreaker.execute(async () => {
                    const response = await client.models.generateContent({
                        model: 'gemini-2.5-flash-lite',
                        contents: promptContent,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: schema,
                            systemInstruction: systemInstruction,
                            safetySettings: SAFETY_SETTINGS
                        }
                    });
                    const r = await parseJsonAsync(response.text || "{}") as GeneratedPrompt;
                    r.modelUsed = "Gemini 2.5 Flash Lite";
                    return r;
                });
                
                if (result!.analysis) result!.analysis += "\n\n[SYSTEM NOTE: Emergency Fallback Protocol (Lite).]";

            } catch (tier3Error: unknown) {
                throw new Error(`ALL TIERS FAILED. Last error: ${parseError(tier3Error)}`);
            }
        }
    }

    return result!;
};

export const generateExpertPrompt = async (
  inputs: ExpertInputs,
  userInput: string,
  mood: string,
  researchData: string,
  isPyriteMode: boolean,
  profile?: IntentProfile,
  negativePrompt?: string,
  onAgentChange?: (agent: AgentType) => void,
  structuredStyle?: StyleComponents,
  lyricsLanguage?: string // New
): Promise<GeneratedPrompt> => {
  if (!inputs.structure || inputs.structure.length === 0) {
      throw new Error("Expert Mode Error: No song structure defined. Add sections to continue.");
  }

  // Construct optimized style string from components or inputs
  let targetStyleString = '';
  if (structuredStyle) {
      targetStyleString = assembleStylePrompt(structuredStyle);
  } else {
      // Fallback builder if not provided explicitly (though it should be)
      targetStyleString = assembleStylePrompt({
          genres: [inputs.genre],
          subGenres: [],
          moods: [mood],
          bpm: inputs.bpm,
          key: inputs.key,
          era: inputs.era,
          vocals: [], // Inferred by AI if empty
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

  // Inject the target style into the prompt as a strict directive
  // Pass lyricsLanguage to the task builder
  const prompt = GENERATE_EXPERT_PROMPT(userInput, researchData, inputs, structureInstructions, mood, lyricsLanguage, isPyriteMode) + 
                 `\n\n**CRITICAL STYLE DIRECTIVE**: The 'style' field output MUST strictly follow this pre-calculated structure:\n"${targetStyleString}, [AI Added Details]"`;

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

  const context = `${inputs.genre} ${mood} ${userInput}`;
  const targetLanguage = 'en'; // Expert mode often implies EN, but we can pass it if we want full localization
  
  // Pass lyricsLanguage explicitly
  const systemInstruction = getSystemInstruction(isPyriteMode, context, profile, negativePrompt, inputs.customPersona, targetLanguage as any, lyricsLanguage) + "\n" + EXPERT_SYSTEM_PROMPT;

  try {
    if (onAgentChange) onAgentChange('generator');
    let json = await executeGenerationCascade(prompt, schema, systemInstruction, 32768, undefined, profile?.complexity);
    
    if (json.tags) json.tags = validateAndFixTags(json.tags);
    if (json.lyrics) json.lyrics = sanitizeLyrics(json.lyrics);

    json = await executeAgenticLoop(json, onAgentChange);

    const validationWarnings = validateExpertOutput(json);
    if (validationWarnings.length > 0 && json.analysis) {
        json.analysis += `\n\n[VALIDATION REPORT]:\n${validationWarnings.join('\n')}`;
    }

    return json;
  } catch (e: unknown) {
    console.error("Expert Generation Failed", e);
    throw new Error(parseError(e));
  }
};

interface AlchemyContext {
    workflow: 'forge' | 'alchemy';
    mode: 'vocals' | 'instrumental' | 'inspire' | 'cover';
    playlistUrl?: string;
}

export const generateSunoPrompt = async (
  intent: string,
  researchData: string,
  mode: 'custom' | 'general' | 'instrumental' | 'easy',
  existingLyrics?: string,
  isPyriteMode: boolean = false,
  onStreamUpdate?: (partial: GeneratedPrompt) => void,
  profile?: IntentProfile,
  negativePrompt?: string,
  onAgentChange?: (agent: AgentType) => void,
  structuredStyle?: StyleComponents,
  alchemyContext?: AlchemyContext,
  targetLanguage: 'en' | 'pl' = 'en',
  lyricsLanguage?: string // New override
): Promise<GeneratedPrompt> => {
  const contextKey = `${intent} ${mode}`;
  const examples = getFewShotExamples(contextKey);

  // If we have structured style, we can use it to guide the model or enhance it
  let finalIntent = intent;
  if (structuredStyle) {
      // Deterministic Enhancement using DB if genre is known
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
      prompt = GENERATE_ALCHEMY_PROMPT(alchemyContext.mode, finalIntent, researchData, alchemyContext.playlistUrl, lyricsLanguage, isPyriteMode);
  } else {
      prompt = GENERATE_SUNO_PROMPT(finalIntent, researchData, mode, existingLyrics, examples, lyricsLanguage, undefined, isPyriteMode);
  }

  const schema: Schema = {
      type: Type.OBJECT,
      properties: {
          analysis: { type: Type.STRING },
          title: { type: Type.STRING },
          tags: { type: Type.STRING },
          style: { type: Type.STRING },
          lyrics: { type: Type.STRING }
      },
      required: ["analysis", "title", "tags", "style"]
  };

  // Pass lyricsLanguage to system instruction builder
  const systemInstruction = getSystemInstruction(isPyriteMode, intent, profile, negativePrompt, undefined, targetLanguage, lyricsLanguage);
  
  // V4.5 requires more thought
  let budget = 24576; 
  if (mode === 'instrumental') budget = 16384;
  if (profile?.complexity === 'complex') budget = 32768; // Use Max Budget for complex queries

  try {
    if (onAgentChange) onAgentChange('generator');
    let json = await executeGenerationCascade(prompt, schema, systemInstruction, budget, onStreamUpdate, profile?.complexity);
    
    if (json.tags) json.tags = validateAndFixTags(json.tags);
    if (json.lyrics) json.lyrics = sanitizeLyrics(json.lyrics);

    json = await executeAgenticLoop(json, onAgentChange);

    return json;

  } catch (error: unknown) {
    throw new Error(parseError(error));
  }
};

export const refineSunoPrompt = async (
  previousResult: GeneratedPrompt,
  instruction: string,
  isPyriteMode: boolean,
  targetLanguage: 'en' | 'pl' = 'en',
  lyricsLanguage?: string // New: Accept lyricsLanguage for Refinement
): Promise<GeneratedPrompt> => {
  const previousJson = JSON.stringify(previousResult, null, 2);
  const prompt = REFINE_PROMPT_TASK(previousJson, instruction, lyricsLanguage); // Pass to task

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

  // Pass lyricsLanguage to system instruction as well
  const systemInstruction = getSystemInstruction(isPyriteMode, instruction, undefined, undefined, undefined, targetLanguage, lyricsLanguage);

  try {
    let json = await executeGenerationCascade(prompt, schema, systemInstruction, 16384);
    
    if (json.tags) json.tags = validateAndFixTags(json.tags);
    if (json.lyrics) json.lyrics = sanitizeLyrics(json.lyrics);

    return json;

  } catch (error: unknown) {
    throw new Error(parseError(error));
  }
};
