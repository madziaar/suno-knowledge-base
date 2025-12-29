
import { Platform } from './core';

export type AgentType = 'idle' | 'researcher' | 'generator' | 'critic' | 'refiner' | 'optimizer';
export type ProducerPersona = 'standard' | 'pyrite' | 'shin' | 'twin_flames' | 'studio_engineer' | 'legal_eagle' | 'orion' | 'custom';
export type SunoVersion = 'v3.5' | 'v4' | 'v4.5' | 'v4.5+' | 'v5';

// Fix: Added ModifierCategory interface used in expert protocol data
export interface ModifierCategory {
  id: string;
  name: string;
  options: string[];
}

export interface SongSection {
  id: string;
  type: string;
  modifiers: string[];
}

export interface StemWeights {
  vocals: number;
  drums: number;
  bass: number;
  melody: number;
  guitar: number;
  piano: number;
  strings: number;
  synth: number;
  fx: number;
  texture: number;
  percussion: number;
  choir: number;
}

export interface ExpertInputs {
  genre: string;
  era: string;
  techAnchor: string;
  bpm: string;
  key: string;
  timeSignature: string;
  structure: SongSection[];
  stemWeights: StemWeights;
  vocalStyle?: string;
  instrumentStyle?: string;
  atmosphereStyle?: string;
  // Studio Mode Specifics
  isRawMode?: boolean; // Bypass creative expansion
  aiModel?: 'gemini-3-pro' | 'gemini-2.5-flash';
  customPersona?: string;
  duration?: number; // Desired duration in seconds (v4.5+ supports up to 480)
}

export interface SongConcept {
  platform: Platform;
  mode: 'custom' | 'general' | 'instrumental' | 'easy';
  workflow: 'forge' | 'alchemy';
  alchemyMode: 'vocals' | 'instrumental' | 'inspire' | 'cover' | 'mashup';
  intent: string;
  artistReference: string;
  mood: string;
  instruments: string;
  lyricsInput: string;
  negativePrompt?: string;
  playlistUrl?: string;
  // Mashup Specifics
  mashupSourceA?: string;
  mashupSourceB?: string;
  targetLanguage?: 'en' | 'pl';
  lyricsLanguage?: string;
  useReMi?: boolean; // Advanced Lyric Logic
  producerPersona?: ProducerPersona;
  sunoVersion?: SunoVersion; // Target Suno Version
  // Advanced Lyric Techniques
  useVowelExtension?: boolean;
  useBackingVocals?: boolean;
  useChords?: boolean;
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

export interface SectionGuideline {
  lineCount: number;
  description: string;
}

export interface StructureTemplate {
  name: string;
  description: string;
  structure: string[];
  guidelines?: Record<string, SectionGuideline>;
}

export interface PromptQualityScore {
  totalScore: number;
  breakdown: {
    completeness: number;
    specificity: number;
    balance: number;
    // Fix: Added coherence field to match sunoValidator output
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

export interface IntentProfile {
  tone: 'aggressive' | 'melancholic' | 'uplifting' | 'technical' | 'chaotic' | 'neutral';
  complexity: 'simple' | 'moderate' | 'complex';
  needsResearch: boolean;
  detectedGenre?: string;
}
