
import { GeneratedPrompt, SongConcept, ExpertInputs, GroundingChunk, AgentType } from "../../types";
import { StyleComponents } from "../../features/generator/utils/styleBuilder";
import { IntentProfile } from "./classifier";

export interface AgentContext {
  id: string;
  userInput: SongConcept;
  expertInputs: ExpertInputs;
  intentProfile: IntentProfile;
  researchData: { text: string; sources: GroundingChunk[] };
  generatedDraft: GeneratedPrompt | null;
  history: string[];
}

export interface GenerationResult {
  success: boolean;
  result?: GeneratedPrompt;
  research?: { text: string; sources: GroundingChunk[] };
  error?: string;
}

export interface IGeneratorService {
  /**
   * Initializes the service with user inputs and mode settings.
   */
  initialize(inputs: SongConcept, expertInputs: ExpertInputs, isPyriteMode: boolean): void;

  /**
   * Phase 1: Runs Intent Classification and Web Research in parallel.
   */
  gatherIntelligence(useGoogleSearch: boolean): Promise<{ text: string; sources: GroundingChunk[] }>;

  /**
   * Phase 2: Executes the generation pipeline (Standard or Expert).
   */
  generate(
    isExpertMode: boolean,
    lyricSource: 'ai' | 'user',
    structuredStyle?: StyleComponents,
    onStreamUpdate?: (partial: GeneratedPrompt) => void,
    onAgentChange?: (agent: AgentType) => void,
    forcedStructure?: string // Automated Studio Logic
  ): Promise<GeneratedPrompt>;

  /**
   * Refines an existing result based on user instruction.
   */
  refine(
    previousResult: GeneratedPrompt,
    instruction: string,
    targetLanguage?: 'en' | 'pl',
    lyricsLanguage?: string
  ): Promise<GeneratedPrompt>;
}
