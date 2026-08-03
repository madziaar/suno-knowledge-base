
import { GeneratedPrompt, GroundingChunk, ExpertInputs, SongConcept, Platform, AgentType } from "../../types";
import { runResearchAgent } from "./agents";
import { classifyIntent, IntentProfile } from "./classifier";
import { generateSunoPrompt, generateExpertPrompt } from "./generators";
import { StyleComponents } from "../../features/generator/utils/styleBuilder";

/**
 * Shared Context Object (The Hive Mind)
 * Stores the state of the generation process as it moves between agents.
 */
export interface AgentContext {
  id: string;
  userInput: SongConcept;
  expertInputs: ExpertInputs;
  intentProfile: IntentProfile;
  researchData: { text: string; sources: GroundingChunk[] };
  generatedDraft: GeneratedPrompt | null;
  history: string[]; // Log of agent actions
}

/**
 * AgentOrchestrator
 * Manages the lifecycle of a generation request, coordinating multiple AI agents
 * (Research, Classification, Generation) to produce a high-quality result.
 */
export class AgentOrchestrator {
  private context: AgentContext;
  private isPyriteMode: boolean;

  constructor(
    inputs: SongConcept, 
    expertInputs: ExpertInputs,
    isPyriteMode: boolean
  ) {
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
   * Phase 1: Parallel Intelligence Gathering
   * Runs Research and Intent Classification concurrently to minimize latency.
   * 
   * @param useGoogleSearch - Force external research if true
   */
  async initializeIntelligence(useGoogleSearch: boolean): Promise<void> {
    const { intent, artistReference } = this.context.userInput;
    
    // Create promises for parallel execution
    const classifierPromise = classifyIntent(`${intent} ${artistReference}`);
    
    // We let the classifier run, but we also check explicit flags
    const shouldResearch = useGoogleSearch || !!artistReference;
    
    const researchPromise = shouldResearch 
      ? runResearchAgent(intent, artistReference, useGoogleSearch)
      : Promise.resolve({ text: '', sources: [] });

    // Await both (Async Batch Processing)
    const [profile, research] = await Promise.all([classifierPromise, researchPromise]);

    this.context.intentProfile = profile;
    this.context.researchData = research;
    this.context.history.push(`[INTEL]: Classified as ${profile.tone}/${profile.complexity}. Research found ${research.sources.length} sources.`);
  }

  /**
   * Phase 2: Generation Cascade
   * Selects the appropriate generator (Expert vs Standard) and executes it.
   * 
   * @param isExpertMode - Whether to use the granular structure builder
   * @param lyricSource - 'ai' to generate lyrics, 'user' to restructure provided text
   * @param onStreamUpdate - Callback for streaming JSON partials to the UI
   * @param onAgentChange - Callback for notifying UI about active agent
   * @param structuredStyle - Optional pre-built style components
   */
  async executeGeneration(
    isExpertMode: boolean, 
    lyricSource: 'ai' | 'user',
    onStreamUpdate?: (partial: GeneratedPrompt) => void,
    onAgentChange?: (agent: AgentType) => void,
    structuredStyle?: StyleComponents
  ): Promise<GeneratedPrompt> {
    const { userInput, expertInputs, researchData, intentProfile } = this.context;
    const { negativePrompt, lyricsLanguage } = userInput; // Extract lyricsLanguage

    // Suno Branch (Default)
    if (isExpertMode) {
        this.context.generatedDraft = await generateExpertPrompt(
            expertInputs,
            userInput.intent,
            userInput.mood,
            researchData.text,
            this.isPyriteMode,
            intentProfile, // Pass profile for tone adjustment
            negativePrompt,
            onAgentChange, // Pass agent callback down
            structuredStyle, // Pass strict style
            lyricsLanguage // Pass language
        );
    } else {
        // Prepare Alchemy Context if workflow is Alchemy
        const alchemyContext = userInput.workflow === 'alchemy' ? {
            workflow: 'alchemy' as const,
            mode: userInput.alchemyMode,
            playlistUrl: userInput.playlistUrl
        } : undefined;

        this.context.generatedDraft = await generateSunoPrompt(
            `${userInput.intent}. Mood: ${userInput.mood}. Instruments: ${userInput.instruments}`,
            researchData.text,
            userInput.mode,
            lyricSource === 'user' ? userInput.lyricsInput : undefined,
            this.isPyriteMode,
            onStreamUpdate,
            intentProfile, // Pass profile for tone adjustment
            negativePrompt,
            onAgentChange, // Pass agent callback down
            structuredStyle, // Pass strict style
            alchemyContext, // Pass alchemy context
            undefined, // targetLanguage (optional fallback)
            lyricsLanguage // Explicit language
        );
    }

    this.context.history.push(`[GEN]: Draft created via ${this.context.generatedDraft.modelUsed}`);
    return this.context.generatedDraft;
  }

  /**
   * Returns the current context state for debugging or history logging.
   */
  getContext() {
    return this.context;
  }
}
