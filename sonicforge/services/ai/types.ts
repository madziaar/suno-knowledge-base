
import { GeneratedPrompt, SongConcept, ExpertInputs, GroundingChunk, IntentProfile } from "../../types";
import { StyleComponents } from "../../features/generator/utils/styleBuilder";

export interface AgentContext {
  id: string;
  userInput: SongConcept;
  expertInputs: ExpertInputs;
  intentProfile: IntentProfile;
  researchData: { text: string; sources: GroundingChunk[] };
  generatedDraft: GeneratedPrompt | null;
  history: string[];
}

export interface IGeneratorService {
  initialize(inputs: SongConcept, expertInputs: ExpertInputs, isPyriteMode: boolean): void;
  gatherIntelligence(useGoogleSearch: boolean): Promise<{ text: string; sources: GroundingChunk[] }>;
  generate(
    isExpertMode: boolean,
    lyricSource: 'ai' | 'user',
    structuredStyle?: StyleComponents
  ): Promise<GeneratedPrompt>;
  refine(
    previousResult: GeneratedPrompt,
    instruction: string,
    targetLanguage?: 'en' | 'pl',
    lyricsLanguage?: string
  ): Promise<GeneratedPrompt>;
}
