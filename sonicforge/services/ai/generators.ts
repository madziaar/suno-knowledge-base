
import { getClient } from "./client";
import { Type, Schema } from "@google/genai";
import { SAFETY_SETTINGS, EXPERT_SYSTEM_PROMPT, getSystemInstruction } from "./config";
import { parseError, retryWithBackoff, globalCircuitBreaker } from "./utils";
import { validateAndFixTags, sanitizeLyrics } from "./validators";
// FIX: Correctly import IntentProfile from the global types file.
import { GeneratedPrompt, ExpertInputs, AgentType, IntentProfile, ProducerPersona } from "../../types";
import { GENERATE_SUNO_PROMPT, GENERATE_EXPERT_PROMPT, getFewShotExamples, REFINE_PROMPT_TASK, GENERATE_ALCHEMY_PROMPT, GENERATE_MASHUP_PROMPT } from "./prompts";
import { runCriticAgent, runRefinerAgent } from "./agents";
import { repairJsonAsync, parseJsonAsync } from "../../lib/json-repair";
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

const MODEL_CASCADE_TIERS = [
    { model: 'gemini-3-pro-preview', tier: 1, budget: 32768, note: "Primary (Pro)", complexity: 'complex' },
    { model: 'gemini-3-flash-preview', tier: 2, budget: 16384, note: "Secondary (Flash)", complexity: 'moderate' },
    { model: 'gemini-2.5-flash-lite', tier: 3, budget: 8192, note: "Emergency (Lite)", complexity: 'simple' }
];

const executeGenerationCascade = async (
    promptContent: string,
    schema: Schema,
    systemInstruction: string,
    baseThinkingBudget: number,
    onStreamUpdate?: (partial: GeneratedPrompt) => void,
    complexity: 'simple' | 'moderate' | 'complex' = 'moderate'
): Promise<GeneratedPrompt> => {
    try {
        return await globalCircuitBreaker.execute(async () => {
            const client = getClient();
            let tiersToTry = MODEL_CASCADE_TIERS;
            
            if (complexity) {
                const startIndex = tiersToTry.findIndex(t => t.complexity === complexity);
                if (startIndex > 0) {
                    tiersToTry = tiersToTry.slice(startIndex);
                }
            }
            
            let lastError: unknown = null;
    
            for (const tier of tiersToTry) {
                try {
                    const result = await retryWithBackoff(async () => {
                        const effectiveBudget = Math.min(baseThinkingBudget, tier.budget);
                        const config: any = { 
                            responseMimeType: "application/json", 
                            responseSchema: schema, 
                            systemInstruction: systemInstruction, 
                            safetySettings: SAFETY_SETTINGS,
                            temperature: 0.8
                        };
    
                        // Both Gemini 3 Pro and Flash support Thinking Config
                        if (tier.model.includes('gemini-3') || tier.model.includes('gemini-2.5')) {
                            config.thinkingConfig = { thinkingBudget: effectiveBudget };
                        }
    
                        let fullText = "";
                        if (onStreamUpdate) {
                             const streamResult = await client.models.generateContentStream({ model: tier.model, contents: promptContent, config });
                             for await (const chunk of streamResult) {
                                const chunkText = chunk.text;
                                if (chunkText) {
                                    fullText += chunkText;
                                    const partial = await repairJsonAsync(fullText);
                                    onStreamUpdate(partial);
                                }
                            }
                        } else {
                             const response = await client.models.generateContent({ model: tier.model, contents: promptContent, config });
                             fullText = response.text || "";
                        }
    
                        const json = await parseJsonAsync(fullText || "{}") as GeneratedPrompt;
                        json.modelUsed = `${tier.note} - ${tier.model}`;
                        
                        if (tier.tier > 1) {
                            json.analysis = `[SYSTEM NOTE: Previous tier model failed. Cascaded to ${tier.note}.] ` + (json.analysis || "");
                        }
                        
                        return json;
                    }, 2, 800);
    
                    return result; // Success!
    
                } catch (error: unknown) {
                    console.warn(`[Generation Cascade] Tier ${tier.tier} (${tier.model}) failed.`, error);
                    lastError = error;
                }
            }
            
            console.error("All generation tiers failed. Returning fallback object.");
            const errorMessage = parseError(lastError);
            return {
                title: "Generation Failed",
                tags: "error, system failure",
                style: "An error occurred during generation. Please check the analysis for details.",
                lyrics: `[SYSTEM_ERROR]\n${errorMessage}`,
                analysis: `[FATAL] The AI core failed to generate a response after trying all model tiers. This is usually due to a persistent API issue (like quota exhaustion or server-side problems) or a safety flag on a complex prompt.\n\nLast Error: ${errorMessage}`,
                modelUsed: 'fallback-system'
            };
        });
    } catch (e: unknown) {
        console.error("Generation failed at the circuit breaker level. Returning fallback object.", e);
        const errorMessage = parseError(e);
        return {
            title: "Generation Halted",
            tags: "error, circuit breaker",
            style: "The system has halted generation due to repeated errors. Please wait a moment before trying again.",
            lyrics: `[CIRCUIT_BREAKER_TRIPPED]\n${errorMessage}`,
            analysis: `[CRITICAL] The generation circuit breaker has been tripped due to multiple consecutive failures. This is a protective measure to prevent API spam during an outage or persistent error state. The system will automatically reset after a cooldown period.\n\nError: ${errorMessage}`,
            modelUsed: 'fallback-system'
        };
    }
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
  lyricsLanguage?: string,
  producerPersona: ProducerPersona = 'standard'
): Promise<GeneratedPrompt> => {
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

  const prompt = GENERATE_EXPERT_PROMPT(userInput, mood, inputs.instrumentStyle || '', researchData, inputs, structureInstructions, lyricsLanguage, isPyriteMode, producerPersona) + 
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
  const targetLanguage = 'en'; 
  
  const systemInstruction = getSystemInstruction(isPyriteMode, context, profile, negativePrompt, inputs.customPersona, targetLanguage as any, lyricsLanguage, producerPersona) + "\n" + EXPERT_SYSTEM_PROMPT;

  
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
  
};

interface AlchemyContext {
    workflow: 'forge' | 'alchemy';
    mode: 'vocals' | 'instrumental' | 'inspire' | 'cover' | 'mashup';
    playlistUrl?: string;
    sourceA?: string;
    sourceB?: string;
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
  lyricsLanguage?: string,
  producerPersona: ProducerPersona = 'standard'
): Promise<GeneratedPrompt> => {
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
      if (alchemyContext.mode === 'mashup') {
          prompt = GENERATE_MASHUP_PROMPT(alchemyContext.sourceA || '', alchemyContext.sourceB || '', finalIntent, isPyriteMode);
      } else {
          prompt = GENERATE_ALCHEMY_PROMPT(alchemyContext.mode, finalIntent, researchData, alchemyContext.playlistUrl, lyricsLanguage, isPyriteMode, producerPersona);
      }
  } else {
      prompt = GENERATE_SUNO_PROMPT(finalIntent, "", "", researchData, mode, existingLyrics, examples, lyricsLanguage, undefined, isPyriteMode, producerPersona);
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

  const systemInstruction = getSystemInstruction(isPyriteMode, intent, profile, negativePrompt, undefined, targetLanguage, lyricsLanguage, producerPersona);
  
  let budget = 32768; // Max power for Pro
  if (mode === 'instrumental') budget = 16384;
  if (profile?.complexity === 'complex') budget = 32768; 

  
  if (onAgentChange) onAgentChange('generator');
  let json = await executeGenerationCascade(prompt, schema, systemInstruction, budget, onStreamUpdate, profile?.complexity);
  
  if (json.tags) json.tags = validateAndFixTags(json.tags);
  if (json.lyrics) json.lyrics = sanitizeLyrics(json.lyrics);

  json = await executeAgenticLoop(json, onAgentChange);

  return json;

  
};

export const refineSunoPrompt = async (
  previousResult: GeneratedPrompt,
  instruction: string,
  isPyriteMode: boolean,
  targetLanguage: 'en' | 'pl' = 'en',
  lyricsLanguage?: string 
): Promise<GeneratedPrompt> => {
  const previousJson = JSON.stringify(previousResult, null, 2);
  const prompt = REFINE_PROMPT_TASK(previousJson, instruction, lyricsLanguage); 

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

  const systemInstruction = getSystemInstruction(isPyriteMode, instruction, undefined, undefined, undefined, targetLanguage, lyricsLanguage);

  
  let json = await executeGenerationCascade(prompt, schema, systemInstruction, 16384, undefined, 'moderate');
  
  if (json.tags) json.tags = validateAndFixTags(json.tags);
  if (json.lyrics) json.lyrics = sanitizeLyrics(json.lyrics);

  return json;

  
};
