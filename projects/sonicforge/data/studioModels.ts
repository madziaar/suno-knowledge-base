
export interface AIModelCapabilities {
  reasoning: number; // 0-100 score
  speed: number; // 0-100 score
  creativity: number; // 0-100 score
  contextWindow: string;
  strengths: string[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'Google' | 'Suno';
  family: 'Gemini' | 'Imagen' | 'Suno';
  version: string;
  tier: 'free' | 'pro' | 'ultra';
  capabilities: AIModelCapabilities;
  description: string;
  isExperimental?: boolean;
}

export const STUDIO_MODELS: AIModel[] = [
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3.0 Pro',
    provider: 'Google',
    family: 'Gemini',
    version: 'Preview 05-14',
    tier: 'pro',
    capabilities: {
      reasoning: 98,
      speed: 60,
      creativity: 95,
      contextWindow: '2M',
      strengths: ['Deep Reasoning', 'Complex Architecture', 'Lyrical Storytelling', 'Abstract Concepts']
    },
    description: 'The heavy lifter. Capable of "Thinking Mode" to plan song structures and narrative arcs before generating JSON.',
    isExperimental: true
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    family: 'Gemini',
    version: 'Latest',
    tier: 'free',
    capabilities: {
      reasoning: 80,
      speed: 95,
      creativity: 85,
      contextWindow: '1M',
      strengths: ['Low Latency', 'Audio Analysis', 'Research', 'Quick Iteration']
    },
    description: 'High-speed, low-latency model. Excellent for quick iterations, simple prompts, and analyzing audio references.'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'Google',
    family: 'Gemini',
    version: 'Latest',
    tier: 'free',
    capabilities: {
      reasoning: 60,
      speed: 100,
      creativity: 70,
      contextWindow: '1M',
      strengths: ['Instant Response', 'Metadata Tagging', 'Classification']
    },
    description: 'The fastest model. Optimized for high-volume tasks like intent classification and simple tag suggestion.'
  }
];

export const getModelById = (id: string): AIModel | undefined => {
  return STUDIO_MODELS.find(m => m.id === id);
};
