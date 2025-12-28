
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
  isFavorite?: boolean; // New: Favorite status
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
}

// --- GENRE TEMPLATES ---

export interface TemplateVariation {
  name: string;
  modifications: string; // Description of changes
  apply?: (base: GenreTemplate) => Partial<GenreTemplate>; // Optional logic override
}

export interface GenreTemplate {
  id: string;
  name: { en: string, pl: string };
  category: string;
  stylePrompt: string; // The "Golden" style string
  bpmRange: [number, number];
  recommendedKeys: string[];
  commonStructure: string[]; // e.g. ["Intro", "Verse", "Chorus"]
  metaTags: string[]; // e.g. ["[Solo]", "[Drop]"]
  tips: string[];
  variations: TemplateVariation[];
  exampleOutput: string; // For preview
}

export interface StoryArc {
  id: string;
  name: { en: string; pl: string }; // Localized name
  description: { en: string; pl: string };
  structure: SongSection[];
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

export interface CloudConfig {
  url: string;
  key: string;
  syncId: string;
}
