
export type Language = 'en' | 'pl';

export type Platform = 'suno';

export type PerformanceMode = 'high' | 'medium' | 'low';

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