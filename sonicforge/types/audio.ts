
export interface AudioAnalysisResult {
  style: string;
  tags: string;
  mood: string;
  instruments: string;
  bpm: string;
  key: string;
  genre: string;
  era: string;
  confidence_score?: number;
  error_measure?: string;
}
