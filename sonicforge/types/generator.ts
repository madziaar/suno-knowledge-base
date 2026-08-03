
import { Platform } from './core';

export type AgentType = 'idle' | 'researcher' | 'generator' | 'critic' | 'refiner';

export interface SongSection {
  id: string;
  type: string;
  modifiers: string[];
}

export interface ExpertInputs {
  genre: string;
  era: string;
  techAnchor: string;
  bpm: string;
  key: string;
  timeSignature: string;
  structure: SongSection[];
  customPersona?: string;
  vocalStyle?: string;
  instrumentStyle?: string;
  atmosphereStyle?: string;
  // Studio Mode Specifics
  isRawMode?: boolean; // Bypass creative expansion
  aiModel?: 'gemini-3-pro' | 'gemini-2.5-flash';
}

export interface SongConcept {
  platform: Platform;
  mode: 'custom' | 'general' | 'instrumental' | 'easy';
  workflow: 'forge' | 'alchemy';
  alchemyMode: 'vocals' | 'instrumental' | 'inspire' | 'cover';
  intent: string;
  artistReference: string;
  mood: string;
  instruments: string;
  lyricsInput: string;
  negativePrompt?: string;
  playlistUrl?: string;
  targetLanguage?: 'en' | 'pl';
  lyricsLanguage?: string; // New: Explicit lyrics language override
}

export interface GeneratedPrompt {
  title: string;
  tags: string;
  style: string;
  lyrics: string;
  analysis: string;
  modelUsed?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface BatchConstraints {
  keepGenre: boolean;
  keepStructure: boolean;
  randomizeMood: boolean;
  randomizeVocals: boolean;
}

export interface GenreDef {
  name: string;
  category: string;
  subGenres: string[];
  bpmRange: [number, number];
  commonKeys: string[];
  instruments: string[];
  vocalsStyle: string[];
  characteristics: string[];
}

export interface StructureTemplate {
  name: string;
  description: string;
  structure: string[];
}

export interface PromptQualityScore {
  totalScore: number;
  breakdown: {
    completeness: number;
    specificity: number;
    balance: number;
    coherence: number;
  };
  grade: string;
  issues: string[];
  suggestions: string[];
  conflicts: string[];
  status: 'critical' | 'warning' | 'good' | 'optimal';
}

export interface PromptComparison {
  title: { diff: string, changed: boolean };
  tags: { added: string[], removed: string[], changed: boolean };
  style: { added: string[], removed: string[], changed: boolean };
  lyrics: { diff: string, changed: boolean };
  analysis: { diff: string, changed: boolean };
}
