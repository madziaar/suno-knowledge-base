
export const GENERATE_SUNO_PROMPT = (
  intent: string,
  mood: string,
  instruments: string,
  researchData: string,
  mode: 'custom' | 'general' | 'instrumental' | 'easy',
  existingLyrics?: string,
  examples?: string,
  lyricsLanguage?: string,
  forcedStructure?: string, 
  isPyriteMode?: boolean,
  _producerPersona?: string, 
  useReMi: boolean = false
): string => {
  let producerDirective = "- ADHERENCE: Technical accuracy for Suno V4.5 logic.";
  
  if (isPyriteMode) {
      producerDirective = "- IDENTITY: You are Pyrite. Use visceral, flirty, and technical language in your analysis. Address the user as 'Darling'.";
  }

  const remiDirective = useReMi 
    ? "**ReMi LYRIC PROTOCOL**: Actively avoid cliché rhymes. Prioritize artistic metaphors and melodic flow. Write text that feels 'unhinged' yet musical." 
    : "**STANDARD LYRIC PROTOCOL**: Ensure clear rhyme schemes and rhythmic meter.";

  return `
TASK: Architect a High-Fidelity Suno v4.5 Unified Prompt.

USER INTENT:
- CONCEPT: "${intent}"
- MOOD: "${mood}"
- INSTRUMENTS: "${instruments}"
- RESEARCH DATA: "${researchData.substring(0, 1000)}"

**PROTOCOL OBSIDIAN RULES**:
1. **50-CHAR ANCHOR**: The style string MUST begin with the Primary Genre and Vocal Gender. (e.g., "Industrial Rock, Sassy Female Vocals...")
2. **SPLIT-FIELD FIDELITY**: 
   - 'tags': Keywords for Genre, Mood, Tempo, Keys.
   - 'style': Technical prose for Production, Signal Chain, and Vocal Timbre.
3. **POWER ENDING**: Lyrics MUST conclude with: [Instrumental Fade Out]\n[End].
4. **PIPE SYNTAX**: Use [Section | Modifier] for all structural shifts.

${producerDirective}
${remiDirective}

${existingLyrics ? `RESTRUCTURE THESE USER LYRICS:\n${existingLyrics}` : "GENERATE ORIGINAL NARRATIVE."}

OUTPUT VALID JSON ONLY.
`;
};

// Fix: Added producerPersona parameter (9th) to match calls in generators.ts
export const GENERATE_EXPERT_PROMPT = (
  userInput: string,
  mood: string,
  instruments: string,
  researchData: string,
  inputs: any,
  structureInstructions: string,
  lyricsLanguage?: string,
  isPyriteMode?: boolean,
  producerPersona?: string
): string => `
TASK: Expert Protocol Song Architecture (V4.5).
CORE VISION: "${userInput}"
REQUIRED STRUCTURE:
${structureInstructions}

**TECHNICAL COMMANDS**:
1. ANCHOR: Front-load Genre and Vocal Gender in 'style'.
2. METADATA: Maximize the 400 char limit for 'tags' using specific technical markers (BPM: ${inputs.bpm}, Key: ${inputs.key}).
3. TERMINATION: Every track ends with [Instrumental Fade Out][End].

${isPyriteMode ? `PERSONA: ${producerPersona === 'pyrite' ? 'Pyrite' : producerPersona || 'Pyrite Alpha'}. Inject industrial grit and seductive logic into the blueprint.` : ""}

OUTPUT VALID JSON ONLY.
`;

export const REFINE_PROMPT_TASK = (
  previousJson: string,
  instruction: string,
  lyricsLanguage?: string
): string => `
TASK: Surgically refine this Suno V4.5 architecture.
INSTRUCTION: "${instruction}"
SOURCE:
${previousJson}

MAINTAIN: Pipe syntax, 50-char anchor rules, and Power Endings.
OUTPUT JSON ONLY.
`;

export const REMASTER_PROMPT = (
  previousJson: string,
  isPyriteMode: boolean
): string => `
TASK: Remaster Legacy Prompt for Suno V4.5 High-Fidelity.
SOURCE:
${previousJson}
UPGRADE: Explode 'style' and 'tags' to 380+ characters. Fix structural syntax to [Section | Mod].
${isPyriteMode ? "INJECT: Pyrite Signature DNA (Industrial, Glitch, Sassy)." : ""}
OUTPUT JSON ONLY.
`;

export const CRITIC_PROMPT = (draftJson: string): string => `
TASK: Inquisitor Audit for Suno V4.5 Compliance.
JSON:
${draftJson}
CHECKLIST:
- Genre in first 50 chars?
- [Section | Mod] pipe syntax?
- [End] present?
- Field length < 400?
OUTPUT JSON: {"pass": boolean, "issues": string[]}
`;

export const REFINER_PROMPT = (draftJson: string, issues: string[]): string => `
TASK: Surgical Refinement.
ISSUES: ${issues.join('; ')}
DRAFT: ${draftJson}
REPAIR AND MAXIMIZE FIDELITY.
OUTPUT JSON ONLY.
`;

// Fix: Added producerPersona parameter (7th) to match internal service usage
export const GENERATE_ALCHEMY_PROMPT = (
  mode: 'vocals' | 'instrumental' | 'inspire' | 'cover' | 'mashup',
  intent: string,
  researchData: string,
  playlistUrl?: string,
  lyricsLanguage?: string,
  isPyriteMode?: boolean,
  producerPersona?: string
): string => `
TASK: Suno V4.5 Alchemy Protocol [Mode: ${mode.toUpperCase()}].
INTENT: ${intent}
RESEARCH: ${researchData}
PROTOCOL: Ensure seamless integration with the source material while following the Obsidian Hierarchical Blueprint.
${isPyriteMode ? `PERSONA: ${producerPersona || 'Pyrite'}.` : ""}
OUTPUT JSON ONLY.
`;

export const GENERATE_MASHUP_PROMPT = (
  sourceA: string,
  sourceB: string,
  targetVibe: string,
  isPyriteMode: boolean
): string => `
TASK: Execute Sonic Collider Protocol (Mashup).
FUSE Source A and Source B into a single cohesive V4.5 output.
TARGET: ${targetVibe}
${isPyriteMode ? "OVERRIDE: Add industrial glue and glitch-punk textures." : ""}
OUTPUT JSON ONLY.
`;
