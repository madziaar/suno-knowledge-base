// Refactored & Strongly-Typed Version of Your Types
// Clean, future-proof, and ready for expansion.

/** ------------------ MESSAGE TYPES ------------------ */

export type Role = 'user' | 'model';
export type MessageType = 'text' | 'song_result';

export interface Message {
  id: string;
  role: Role;
  content: string;
  /** Streaming flag for partial assistant message */
  isStreaming?: boolean;
  /** Message classification */
  type?: MessageType;
  /** Parsed song object (if message is a song result) */
  parsedSong?: ParsedSong;
}

/** ------------------ SONG STRUCTURE ------------------ */

export interface ParsedSong {
  title: string;
  voice: string;
  style: string;
  tags: string[];
  lyrics: string;
  videoPrompt?: string; // New: For AI Video generation
}

/** ------------------ STUDIO SETTINGS ------------------ */

export interface StudioSettings {
  mood: {
    darkBright: number; // 0 (Dark) to 100 (Bright)
    cleanGritty: number; // 0 (Clean) to 100 (Gritty)
    energy: number; // 0 (Chill) to 100 (Hype) - NEW
  };
  vocal: {
    gender: 'Any' | 'Male' | 'Female' | 'Duet' | 'Choir' | 'AI/Robotic';
    texture: 'Any' | 'Airy' | 'Raspy' | 'Auto-Tuned' | 'Operatic' | 'Screaming' | 'Whisper' | 'Robotic';
  };
  structure: 'Auto' | 'Pop Standard' | 'Rap/Trap' | 'EDM/Club' | 'Rock/Metal' | 'Linear/Prog' | 'Mahraganat' | 'Lo-fi Loop';
}

/** ------------------ APP SETTINGS ------------------ */

export interface AppSettings {
  generation: {
    modelPreference: 'speed' | 'quality';
    temperature: number; // 0.0 to 2.0
  };
  ui: {
    soundEnabled: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
  developer: {
    showDebug: boolean;
    showSystemPrompt: boolean;
  };
}

/** ------------------ GENERATION MODES ------------------ */

export enum GeneratorMode {
  NORMAL = 'NORMAL',
  RANDOM = 'RANDOM',
  CRAZY = 'CRAZY',
  KPOP_RANDOM = 'KPOP_RANDOM',
  KPOP_3_VOICES = 'KPOP_3_VOICES',
  TRENDING = 'TRENDING',
  THINKING = 'THINKING',
}

/** ------------------ SUPPORTED LANGUAGES ------------------ */

export enum LyricsLanguage {
  ENGLISH = 'English',
  ARABIC = 'Arabic',
  MIXED = 'Mixed (Arabic/English)',
}

/** ------------------ CHAT STATE ------------------ */

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}