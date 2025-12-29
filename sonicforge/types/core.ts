
export type Language = 'en' | 'pl';

export type Platform = 'suno';

// Fix: Added 'balanced' to PerformanceMode to match SettingsModal and solve comparison overlap errors
export type PerformanceMode = 'high' | 'balanced' | 'low';

export enum GeneratorState {
  IDLE = 'idle',
  RESEARCHING = 'researching',
  ANALYZING = 'analyzing',
  GENERATING = 'generating',
  // Fix: Added OPTIMIZING state to match usage in GeminiService and UI components
  OPTIMIZING = 'optimizing',
  COMPLETE = 'complete',
  ERROR = 'error'
}
