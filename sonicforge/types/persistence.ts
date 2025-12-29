
import { SongConcept, ExpertInputs, GeneratedPrompt, GroundingChunk, SongSection } from './generator';
import { Platform } from './core';

export interface HistoryItem {
  id: string;
  timestamp: number;
  inputs: SongConcept;
  expertInputs?: ExpertInputs;
  isExpertMode: boolean;
  result: GeneratedPrompt;
  lyricSource: 'ai' | 'user';
  researchData: { text: string; sources: GroundingChunk[] } | null;
  isFavorite?: boolean;
}

export interface Preset {
  id: string;
  category?: string;
  platform?: Platform;
  name: { en: string; pl: string };
  description: { en: string; pl: string };
  tags?: string;
  style: string;
  mood: string;
  instruments: string;
  suggestedMode?: 'custom' | 'general' | 'instrumental';
  lyrics?: string;
}

export interface UserPreset {
  id: string;
  name: string;
  inputs: SongConcept;
  expertInputs: ExpertInputs;
  isExpertMode: boolean;
  timestamp: number;
}

export interface Persona {
  id: string;
  name: string;
  prompt: string;
  avatar?: string;
}

// --- GENRE TEMPLATES ---

export interface TemplateVariation {
  name: string;
  modifications: string;
  apply?: (base: GenreTemplate) => Partial<GenreTemplate>;
}

export interface GenreTemplate {
  id: string;
  name: { en: string, pl: string };
  category: string;
  stylePrompt: string;
  bpmRange: [number, number];
  recommendedKeys: string[];
  commonStructure: string[];
  metaTags: string[];
  tips: string[];
  variations: TemplateVariation[];
  exampleOutput: string;
}

export interface StoryArc {
  id: string;
  name: { en: string; pl: string };
  description: { en: string; pl: string };
  structure: SongSection[];
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

export interface CloudConfig {
  url: string;
  key: string;
  syncId: string;
}
