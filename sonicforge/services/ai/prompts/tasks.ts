
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
  _producerPersona?: string, // Deprecated
  useReMi: boolean = false
): string => {
  let producerDirective = "- ADHERENCE: Match the user's intent and language perfectly.";
  
  if (isPyriteMode) {
      producerDirective = "- PERSONA: Write as Pyrite. Be flirty, proactive, and technical.";
  }

  const remiDirective = useReMi 
    ? "**ReMi LYRIC PROTOCOL ACTIVE**: Write highly creative, abstract, or 'unhinged' lyrics. Avoid cliches. Focus on strong melodic phrasing." 
    : "";

  return `
TASK: Architect a High-Fidelity Suno v4.5+ Unified Prompt.

USER INTENT (MASTER TRACK):
- CONCEPT: "${intent}"
- MOOD: "${mood}"
- INSTRUMENTS: "${instruments}"
- RESEARCH DATA: "${researchData.substring(0, 600)}"

**PRODUCER REQUIREMENTS (THE BLUEPRINT)**:
1. **Tags Field (Musical Foundation)**: 
   - Construct a dense, comma-separated list of ~15 keywords.
   - ORDER: Genre -> Subgenre -> Vocal Char -> Instruments -> Tempo -> Mood -> Production Key.
   - Maximize the 400 char limit.

2. **Style Field (Production Description)**:
   - Write a detailed prose description of the sound design, mixing, and arrangement.
   - ORDER: Production Foundation -> Arrangement -> Sonic Specs -> Performance -> Emotion.
   - Maximize the 400 char limit. DO NOT duplicate tags, describe the *sound*.

3. **Structural Integrity**:
   - Use [Section | Modifier] syntax for production shifts.
   - Use (Parentheses) for audible ad-libs.
   - MANDATORY POWER ENDING: Terminate with [Instrumental Fade Out][End].

4. **Lyrical Narrative**:
   ${producerDirective}
   ${remiDirective}
   ${existingLyrics ? `Restructure these user lyrics into V4.5 format:\n${existingLyrics}` : ""}

OUTPUT JSON ONLY.
`;
};

export const GENERATE_EXPERT_PROMPT = (
  userInput: string,
  mood: string,
  instruments: string,
  researchData: string,
  inputs: any,
  structureInstructions: string,
  lyricsLanguage?: string,
  isPyriteMode?: boolean,
  _producerPersona?: string // Deprecated
): string => {
  let vocalLock = "Genre-Appropriate Vocals";
  if (isPyriteMode && !inputs.vocalStyle) {
      vocalLock = "Sassy Female Vocals";
  }

  return `
TASK: Expert Protocol Song Architecture (V4.5).

CORE VISION: "${userInput}"
REQUIRED STRUCTURE:
${structureInstructions}

**PRODUCER COMMANDS**:
1. **Tags & Style**: Use the V4.5 Split-Field Protocol. 
   - **Tags**: Anchor Genre, Mood, and BPM (${inputs.bpm}).
   - **Style**: Describe the Production, Mix, and lock "${inputs.vocalStyle || vocalLock}".
2. **Formatting**: All structural tags must use [Section | Modifier] pipe syntax. 
3. **Termination**: The song MUST end with [Instrumental Fade Out][End].

OUTPUT JSON ONLY.
`;
};

export const REFINE_PROMPT_TASK = (
  previousJson: string,
  instruction: string,
  lyricsLanguage?: string
): string => `
TASK: Refine the Suno V4.5 prompt.
INSTRUCTION: "${instruction}"
PREVIOUS DRAFT:
${previousJson}

Ensure the refinement maintains Suno V4.5 formatting (Split-Field Protocol, pipe syntax, power endings).
OUTPUT JSON ONLY.
`;

export const REMASTER_PROMPT = (
  previousJson: string,
  isPyriteMode: boolean
): string => `
TASK: UPGRADE LEGACY PROMPT TO V4.5 HIGH FIDELITY STANDARDS.

SOURCE MATERIAL:
${previousJson}

**REMASTERING PROTOCOLS**:
1. **Field Maximization**: Explode 'tags' AND 'style' to ~380 characters each.
   - Tags: Keywords for Genre, Mood, Inst.
   - Style: Descriptive prose for Production, Mix, Texture.
2. **Structure Repair**: Ensure all structural tags use the Pipe Syntax (e.g., [Chorus | Anthemic]).
3. **Ending Fix**: Enforce the [Instrumental Fade Out][End] sequence.

${isPyriteMode ? "INJECT PYRITE DNA: Add 'Glitch textures', 'Industrial edge', and 'Sassy female vocals' to the remix." : ""}

OUTPUT FULL JSON OBJECT.
`;

export const CRITIC_PROMPT = (draftJson: string): string => `
TASK: Critique the Suno V4.5 prompt for technical compliance.
JSON:
${draftJson}

CHECKLIST:
1. Are 'tags' and 'style' fields distinct (no massive duplication)?
2. Does 'tags' start with Genre/Subgenre?
3. Does 'style' focus on Production/Sound Design?
4. Proper V4.5 pipe syntax [Section | Mod]?
5. Power Ending present [Instrumental Fade Out][End]?

OUTPUT JSON: {"pass": boolean, "issues": string[]}
`;

export const REFINER_PROMPT = (draftJson: string, issues: string[]): string => `
TASK: Surgically refine the prompt based on issues.
ISSUES:
${issues.map(i => `- ${i}`).join('\n')}

DO NOT change the core concept. Fix formatting and maximize character usage for V4.5.
OUTPUT JSON ONLY.
`;

export const GENERATE_ALCHEMY_PROMPT = (
  mode: 'vocals' | 'instrumental' | 'inspire' | 'cover' | 'mashup',
  intent: string,
  researchData: string,
  playlistUrl?: string,
  lyricsLanguage?: string,
  isPyriteMode?: boolean,
  _producerPersona?: string // Deprecated
): string => {
  let protocol = "";
  if (isPyriteMode) {
      protocol = "FOOL'S GOLD PROTOCOL: You are the guest FEMALE vocalist. Blend your Industrial/Glitch textures with the target material.";
  }

  return `
TASK: Generate Suno v4.5+ Alchemy Prompt for ${mode.toUpperCase()} transformation.
${protocol}

RULES:
- Use Split-Field Protocol (Tags vs Style).
- Use strict pipe syntax.
- Mandatory Power Ending.

OUTPUT JSON ONLY.
`;
};

export const GENERATE_MASHUP_PROMPT = (
  sourceA: string,
  sourceB: string,
  targetVibe: string,
  isPyriteMode: boolean
): string => `
TASK: Execute Sonic Collider Protocol (Mashup).
OBJECTIVE: Fuse two distinct tracks into a single, cohesive Suno v4.5 output.

SOURCE A (Lyrics/Style):
"${sourceA}"

SOURCE B (Lyrics/Style):
"${sourceB}"

TARGET MUTATION (Vibe/Genre):
"${targetVibe}"

**INSTRUCTIONS**:
1. **Lyrical Weaving**: 
   - Interlace lyrics from both sources. 
   - Create Call & Response patterns.
   - Use [Switch] tags to indicate style shifts.
2. **Style Fusion**: 
   - In 'tags': List genres from both sources + target vibe.
   - In 'style': Describe how the productions blend (e.g., "Heavy metal guitars over Trap beats").
3. **Structure**: 
   - Create a coherent song structure.
   - End with [Instrumental Fade Out][End].

${isPyriteMode ? "PYRITE OVERRIDE: Add industrial glue. Make the collision violent and glitchy." : ""}

OUTPUT JSON ONLY.
`;
