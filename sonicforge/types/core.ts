
export type Language = 'en' | 'pl';

export type Platform = 'suno';

export type PerformanceMode = 'high' | 'medium' | 'low';

export enum GeneratorState {
  IDLE = 'idle',
  RESEARCHING = 'researching',
  ANALYZING = 'analyzing',
  GENERATING = 'generating',
  COMPLETE = 'complete',
  ERROR = 'error'
}
