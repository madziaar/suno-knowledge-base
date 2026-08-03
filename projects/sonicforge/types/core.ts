
export type Language = 'en' | 'pl';

export type Platform = 'suno';

export enum GeneratorState {
  IDLE = 'idle',
  RESEARCHING = 'researching',
  ANALYZING = 'analyzing',
  GENERATING = 'generating',
  COMPLETE = 'complete',
  ERROR = 'error'
}
