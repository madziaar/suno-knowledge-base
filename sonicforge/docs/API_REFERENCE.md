
# API Reference (V7.0 - Aether)

> **UPDATE**: The core API monolith has been shattered into specialized services.

## Generators (`services/ai/generators.ts`)

### `generateSunoPrompt(...)` / `generateExpertPrompt(...)`
Uses Gemini 3 Pro Preview with Thinking Mode (Streaming Enabled).
- **Purpose**: The main engine. Generates the structured JSON containing Title, Tags, Style, Analysis, and Lyrics.
- **New**: Can accept an optional `structuredStyle: StyleComponents` object to enforce the Golden Rule ordering deterministically.

### `generateRiffusionPrompt(...)`
Uses Gemini 2.5 Flash (Fast Logic).
- **Purpose**: Specialized generator for Riffusion Fuzz-1.1. Creates dense, comma-separated style strings.

### `refineSunoPrompt(...)` / `refineRiffusionPrompt(...)`
- **Purpose**: Iteratively adjusts prompts based on natural language feedback from the Chat UI.

## Research (`services/ai/research.ts`)

### `researchArtist(query: string)`
Uses Gemini 2.5 Flash with Google Search grounding.
- **Output**: `{ text: string, sources: GroundingChunk[] }`
- **Purpose**: Fetches real-world production data about an artist.

## Analysis (`services/ai/analysis.ts`)

### `analyzeAudioReference(audioBase64: string, mimeType: string, isPyriteMode: boolean)`
Uses Gemini 2.5 Flash (Multimodal).
- **Output**: `Promise<AudioAnalysisResult>`
- **Purpose**: "Listens" to an audio file and extracts BPM, Key, Instruments, and a detailed style description.

## Tools (`services/ai/tools.ts`)

### `quickEnhance(input, field)`
Uses Gemini 2.5 Flash-Lite.
- **Purpose**: Fast, low-cost expansion of short user inputs (Creative Boost).

### `rewriteLyricFragment(fragment, context, mode, isPyriteMode)`
- **Purpose**: Context-aware lyric editing tool for Flow, Edgy, Rhyme, Vowel Extension, and Chords.

### `getRhymes(word, context, language)`
- **Purpose**: Context-aware rhyming dictionary.

### `generateBatchVariations(basePrompt, count, level, isPyriteMode, constraints)`
- **Output**: `Promise<GeneratedPrompt[]>`
- **Purpose**: Creates multiple alternative prompts based on a base result, respecting creative constraints for controlled brainstorming.

### `detectStructure(lyrics, isPyriteMode)`
- **Output**: `Promise<SongSection[]>`
- **Purpose**: Analyzes raw lyrics to detect and structure song sections (Verse, Chorus, etc.) using AI.

## Prompt Analysis (`features/generator/utils/promptAnalysis.ts`) - NEW!

### `scorePrompt(prompt: GeneratedPrompt, platform: Platform)`
- **Output**: `PromptQualityScore`
- **Purpose**: Rates a prompt's quality (0-100), completeness, specificity, balance, and coherence. Provides grade and actionable suggestions.

### `comparePrompts(prompt1: GeneratedPrompt, prompt2: GeneratedPrompt)`
- **Output**: `PromptComparison`
- **Purpose**: Highlights differences between two prompts across all fields (title, tags, style, lyrics, analysis).

### `extractTemplate(prompt: GeneratedPrompt)`
- **Output**: `Partial<GenreTemplate>`
- **Purpose**: Converts an existing `GeneratedPrompt` into a reusable template structure, identifying its core components for future reuse.

## Neural Link (Sharing) (`lib/sharing.ts`)

### `compressState(...)`
Uses `lz-string` via a Web Worker to compress the application state into a URL-safe string.

### `decompressState(encodedString)`
Decompresses a URL string back into application state.

### `generateShareLinks(title, url)`
- **Purpose**: Creates pre-formatted URLs for social media sharing.

## Core Types

### `SongConcept`
The raw user input from the UI forms.
```typescript
interface SongConcept {
  platform: 'suno' | 'riffusion';
  mode: 'custom' | 'general' | 'instrumental';
  intent: string;
  artistReference: string;
  mood: string;
  instruments: string;
  lyricsInput: string;
  negativePrompt?: string;
  riffusionSettings?: RiffusionSettings;
}
```

### `ExpertInputs`
Data from the "Expert Protocol" panel.
```typescript
interface ExpertInputs {
  genre: string;
  era: string;
  techAnchor: string;
  bpm: string;
  key: string;
  timeSignature: string;
  structure: SongSection[];
  customPersona?: string;
  vocalStyle?: string;
  instrumentStyle?: string;
  atmosphereStyle?: string;
}
```

### `RiffusionSettings`
```typescript
interface RiffusionSettings {
  strength: number; // 0-100
  weirdness: number; // 0-100
  lyricsStrength?: number;
  useMultiplication: boolean;
  model: 'fuzz-1.0' | 'fuzz-1.1' | 'fuzz-1.1-pro';
  seed: number | null;
}
```

### `AudioAnalysisResult`
The output from the Sonic Mirror audio analysis.
```typescript
interface AudioAnalysisResult {
  style: string;
  tags: string;
  mood: string;
  instruments: string;
  bpm: string;
  key: string;
  genre: string;
  era: string;
}
```

### `GeneratedPrompt`
The structured output from the AI. Validated by Zod to ensure fields are non-null.
```typescript
interface GeneratedPrompt {
  title: string;
  tags: string;
  style: string;
  lyrics: string;
  analysis: string;
  modelUsed?: string;
}
```

### `HistoryItem`
Data structure for saved sessions.
```typescript
interface HistoryItem {
  id: string;
  timestamp: number;
  inputs: SongConcept;
  expertInputs?: ExpertInputs;
  isExpertMode: boolean;
  result: GeneratedPrompt;
  lyricSource: 'ai' | 'user';
  researchData: { text: string; sources: GroundingChunk[] } | null;
}
```

### `PromptQualityScore`
Output from `scorePrompt`.
```typescript
interface PromptQualityScore {
  totalScore: number; // 0-100
  breakdown: {
    completeness: number; // 0-30
    specificity: number; // 0-30
    balance: number;   // 0-20
    coherence: number; // 0-20 (from conflicts)
  };
  grade: string; // "A+", "B-" etc.
  issues: (keyof ValidationMessages)[]; // List of detected issues (raw from validator)
  suggestions: string[]; // Actionable suggestions
  conflicts: string[]; // List of detected conflicts
  status: 'critical' | 'warning' | 'good' | 'optimal';
}
```

### `PromptComparison`
Output from `comparePrompts`.
```typescript
interface PromptComparison {
  title: { diff: string, changed: boolean };
  tags: { added: string[], removed: string[], changed: boolean };
  style: { added: string[], removed: string[], changed: boolean };
  lyrics: { diff: string, changed: boolean };
  analysis: { diff: string, changed: boolean };
}
```