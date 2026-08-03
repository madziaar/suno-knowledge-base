
# CORE TYPE DEFINITIONS

> **Source**: `src/types.ts`
> **Validation**: `services/ai/validators.ts` (Zod)
> **Usage**: Reference for JSON Schemas and State Objects.

## Interfaces

```typescript
export interface SongConcept {
  mode: 'custom' | 'general' | 'instrumental';
  intent: string;
  artistReference: string;
  mood: string;
  instruments: string;
  lyricsInput?: string;
  negativePrompt?: string;
  bpmKey?: string;
}

export interface GeneratedPrompt {
  title?: string;     // Validated: Max 80 chars
  tags?: string;      // Validated: Max 1000 chars, lowercase
  style?: string;     // Validated: Max 1000 chars
  lyrics?: string;    // Validated: Max 5000 chars, strict brackets
  analysis?: string;  // Markdown allowed
  researchNotes?: string;
}

export interface ExpertInputs {
  genre: string;
  era: string;
  bpm: string;
  key: string;
  techAnchor: string;
  structure: SongSection[];
}
```

## Runtime Validation (Zod)

Incoming AI responses are validated against the following hardened schema to prevent UI crashes and handle null values:

```typescript
// V9.0 Hardened Schema
const GeneratedPromptSchema = z.object({
  title: z.string().nullable().optional().transform(v => v ?? ""),
  tags: z.string().nullable().optional().transform(v => v ?? ""),
  style: z.string().nullable().optional().transform(v => v ?? ""),
  lyrics: z.string().nullable().optional().transform(v => v ?? ""),
  analysis: z.string().nullable().optional().transform(v => v ?? ""),
});
```

*Note: Limits in Zod are set slightly higher than strict limits to allow the application code to gracefully truncate rather than rejecting the entire payload.*