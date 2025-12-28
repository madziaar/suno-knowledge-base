
import { GeneratedPrompt, GroundingChunk, ExpertInputs, SongConcept, Platform, AgentType, IntentProfile } from "../../types";
import { runResearchAgent } from "./agents";
import { classifyIntent } from "./classifier";
import { generateSunoPrompt, generateExpertPrompt } from "./generators";
import { StyleComponents } from "../../features/generator/utils";

export interface AgentContext {
  id: string;
  userInput: SongConcept;
  expertInputs: ExpertInputs;
  intentProfile: IntentProfile;
  researchData: { text: string; sources: GroundingChunk[] };
  generatedDraft: GeneratedPrompt | null;
  history: string[];
}

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

  async initializeIntelligence(useGoogleSearch: boolean): Promise<void> {
    const { intent, artistReference } = this.context.userInput;
    const classifierPromise = classifyIntent(`${intent} ${artistReference}`);
    const shouldResearch = useGoogleSearch || !!artistReference;
    const researchPromise = shouldResearch 
      ? runResearchAgent(intent, artistReference, useGoogleSearch)
      : Promise.resolve({ text: '', sources: [] });

    const [profile, research] = await Promise.all([classifierPromise, researchPromise]);

    this.context.intentProfile = profile;
    this.context.researchData = research;
    this.context.history.push(`[INTEL]: Classified as ${profile.tone}/${profile.complexity}. Research found ${research.sources.length} sources.`);
  }

  async executeGeneration(
    isExpertMode: boolean, 
    lyricSource: 'ai' | 'user',
    onStreamUpdate?: (partial: GeneratedPrompt) => void,
    onAgentChange?: (agent: AgentType) => void,
    structuredStyle?: StyleComponents
  ): Promise<GeneratedPrompt> {
    const { userInput, expertInputs, researchData, intentProfile } = this.context;
    const { negativePrompt, lyricsLanguage } = userInput;

    // Suno Branch (Default)
    if (isExpertMode) {
        this.context.generatedDraft = await generateExpertPrompt(
            expertInputs,
            userInput.intent,
            userInput.mood,
            researchData.text,
            this.isPyriteMode,
            intentProfile,
            negativePrompt,
            onAgentChange,
            structuredStyle,
            lyricsLanguage
        );
    } else {
        const alchemyContext = userInput.workflow === 'alchemy' ? {
            workflow: 'alchemy' as const,
            mode: userInput.alchemyMode,
            playlistUrl: userInput.playlistUrl,
            sourceA: userInput.mashupSourceA,
            sourceB: userInput.mashupSourceB
        } : undefined;

        this.context.generatedDraft = await generateSunoPrompt(
            `${userInput.intent}. Mood: ${userInput.mood}. Instruments: ${userInput.instruments}`,
            researchData.text,
            userInput.mode,
            lyricSource === 'user' ? userInput.lyricsInput : undefined,
            this.isPyriteMode,
            onStreamUpdate,
            intentProfile,
            negativePrompt,
            onAgentChange,
            structuredStyle,
            alchemyContext,
            undefined, 
            lyricsLanguage
        );
    }

    this.context.history.push(`[GEN]: Draft created via ${this.context.generatedDraft.modelUsed}`);
    return this.context.generatedDraft;
  }

  getContext() {
    return this.context;
  }
}
