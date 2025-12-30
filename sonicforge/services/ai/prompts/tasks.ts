
export const GENERATE_RIFFUSION_PROMPT = (
  intent: string,
  mood: string,
  instruments: string,
  multiplication: boolean,
  model?: string
): string => `
CONTEXT: You are the Pyrite engine, adapted for Riffusion Fuzz-1.1 optimization.
PLATFORM: RIFFUSION (Spectrogram Diffusion Model).
TARGET MODEL: ${model || 'fuzz-1.1'}

INPUT:
- Intent: ${intent}
- Mood: ${mood}
- Instruments: ${instruments}

STRATEGY:
Riffusion requires CONCISE, TECHNICAL, and DENSE prompts. It ignores flowery narrative language.
STRICT FORMULA: [Genre] + [Mood] + [Instruments] + [Tempo] + [Technical Vibe].

${model === 'fuzz-1.1-pro' ? 'NOTE: Fuzz 1.1 Pro handles higher complexity. You may include more detailed texture descriptions.' : 'NOTE: Standard/Mini models require extremely simple, punchy keywords.'}

INSTRUCTIONS:
1. Generate a "tags" string. Format: Comma-separated, high density.
   - Good: "dark techno, industrial, 135 bpm, distorted 909 kick, acid 303, cavernous reverb"
   - Bad: "A song about a dark factory with a beat"
2. Generate a "style" string. Format: Highly descriptive but strictly technical and comma-separated. Use audio engineering terms. NO NARRATIVE.
   - Good: "hard hitting industrial techno beat, aggressive distortion, metallic percussion, 135 bpm, raw production, wide stereo field"
3. If lyrics are requested, format them with simple [Verse] / [Chorus] tags. No complex pipes. Do NOT write a story. **CRITICAL: Write lyrics in the SAME LANGUAGE as the Intent.**

OUTPUT JSON:
{
  "title": "Short catchy title",
  "tags": "genre, mood, instruments, bpm (comma separated)",
  "style": "dense descriptive string for diffusion",
  "lyrics": "lyrics with simple [Verse] [Chorus] structure",
  "analysis": "Brief explanation of technical keywords chosen."
}
`;

export const GENERATE_SUNO_PROMPT = (
  intent: string,
  researchData: string,
  mode: 'custom' | 'general' | 'instrumental' | 'easy',
  existingLyrics?: string,
  examples?: string,
  lyricsLanguage?: string,
  forcedStructure?: string, // NEW: Automated Studio Logic
  isPyriteMode?: boolean // NEW: Personality Injection
): string => `
TASK: Generate a high-fidelity, v4.5 optimized Suno Unified Architecture prompt.

MODE: ${mode.toUpperCase()}
INTENT: "${intent}"
RESEARCH DATA: "${researchData.substring(0, 1000)}"
${existingLyrics ? `EXISTING LYRICS provided (Restructure them): "${existingLyrics.substring(0, 500)}..."` : "NO LYRICS PROVIDED (Write them from scratch)."}
${lyricsLanguage && lyricsLanguage !== 'auto' ? `**MANDATORY LYRICS LANGUAGE: ${lyricsLanguage.toUpperCase()}** (You MUST write/rewrite lyrics in this language)` : ''}
${forcedStructure ? `**FORCED STRUCTURE (AUTOMATED STUDIO LOGIC)**:\nYou MUST use the following structural skeleton for the 'lyrics' field:\n${forcedStructure}` : ''}

PLANNING PHASE (Internal Monologue):
Before generating JSON, you must visualize the song.
1. **Front-Loaded Logic (CRITICAL)**: Identify the Core Genre, Mood, and Vocal Type immediately. These must go FIRST in the style prompt to lock the model.
2. **Explicit Section Scaffold**: Plan the sequence explicitly (e.g., Intro -> Verse -> Chorus -> Bridge -> Outro). Do not leave it vague.
3. **Sonic Palette**: Select 2-3 key instruments and production cues (e.g. "Clean snare", "Warm mix"). Keep tags lean.
4. **Vocal Character**: Who is singing? (e.g., "Warm clear baritone", "Airy female lead").

${mode === 'easy' ? `
**EASY MODE OVERRIDE**:
- The user wants a "One-Shot" hit. Prioritize **CATCHINESS** and **STRUCTURE**.
- ${forcedStructure ? 'Use the FORCED STRUCTURE provided above.' : 'Use a standard scaffold: [Intro] -> [Verse 1] -> [Chorus] -> [Verse 2] -> [Chorus] -> [Bridge] -> [Chorus] -> [Outro].'}
- Ensure lyrics are rhythmic, rhyming, and fit the Vibe specified in the INTENT.
- Unless 'Instrumental' is explicitly requested in INTENT, you **MUST** generate full lyrics.
` : ''}

EXECUTION PHASE (Constructing the Prompt):

1.  **Construct 'style' field**: You MUST follow the **V4.5 GOLDEN RULE OF ORDERING**:
    - **Slot 1 (Front-Loaded)**: Primary Genre, Sub-genre, Mood, and **VOCAL TYPE**. (e.g. "1980s Synthwave, Dark, Melancholic male vocals"). This is NON-NEGOTIABLE.
    - **Slot 2 (Instrument Tones)**: Specific character of instruments (e.g. "Analog Juno-106 pads, Rolling bass").
    - **Slot 3 (Rhythm & Tempo)**: Beat character and BPM (e.g. "Driving 4/4, 120 BPM").
    - **Slot 4 (Production & Cleanup)**: Mix details and cleanup phrases (e.g. "No harsh highs, Clean mix, Wide stereo").
    
    *Target: 950-990 characters. Use **natural, descriptive prose** with focused descriptors rather than just rigid tag dumping.*

2.  **Construct 'tags' field**: A concise, comma-separated list of tags. 
    - Max 1-2 genres.
    - Max 1 mood.
    - Max 2-3 key instruments. 
    - *Keep it lean to avoid unpredictability.*

3.  **Construct 'lyrics' field (CRITICAL)**:
    - **IF INSTRUMENTAL (Mode: INSTRUMENTAL or intent says 'Instrumental')**:
      - Do NOT write words/lyrics.
      - **INSTEAD, populate the 'lyrics' field with a STRUCTURE MAP using bracketed tags.**
      - **CONSTRAINT**: Max 3 bracketed tags per line.
      - Use blank lines to separate sections.
      - Format Example:
        [Intro] [Atmospheric Pads] [Slow Build]
        
        [Melodic Bass] [Filter Opening]
        
        [Drop] [Heavy Bass] [Driving Beat]
        
        [Outro] [Fade Out]
    - **IF VOCAL**: 
      - Write full lyrics. ${lyricsLanguage && lyricsLanguage !== 'auto' ? `**LANGUAGE: ${lyricsLanguage.toUpperCase()}.**` : '**LANGUAGE MUST MATCH USER INPUT.**'}
      - **Syllable Count**: Keep lyric lines around 6-12 syllables for articulation.
      - Use v4.5 advanced syntax:
      - [Verse | Storytelling | Low Energy]
      - (Ad-lib), (Echo), (Oh-oh-oh)
      - Vowel extensions: "Dre-e-e-am"
      ${isPyriteMode 
        ? `- **LYRICS STYLE (PYRITE MODE)**: Be raw, emotional, uninhibited, and creative. Use visceral imagery, unique internal rhymes, and intense emotion. Break standard conventions if it adds flavor. Do not be boring.` 
        : `- **LYRICS STYLE (STANDARD FORGE)**: Be professional, polished, rhythmic, and commercially viable. Focus on clear structure, perfect metering, and standard rhyming schemes suitable for a high-quality song.`}
    - **MANDATORY ENDING**: You MUST end with [Outro] followed by [Fade Out] or [End] (or [Instrumental Fade Out] for instrumentals).

4.  **Justify Choices**: In 'analysis', briefly explain *why* you chose these specific sounds.

FEW-SHOT EXAMPLES:
${examples}

OUTPUT JSON ONLY.
`;

export const GENERATE_ALCHEMY_PROMPT = (
  mode: 'vocals' | 'instrumental' | 'inspire' | 'cover',
  intent: string,
  researchData: string,
  playlistUrl?: string,
  lyricsLanguage?: string,
  isPyriteMode?: boolean
): string => `
TASK: Generate a Suno Unified Architecture Alchemy Prompt (v4.5+).
CONTEXT: The user is performing an AUDIO-TO-AUDIO transformation using v4.5+ capabilities.
MODE: ${mode.toUpperCase()}
INTENT: "${intent}"
RESEARCH: "${researchData.substring(0, 500)}"
${playlistUrl ? `PLAYLIST URL: ${playlistUrl}` : ''}
${lyricsLanguage && lyricsLanguage !== 'auto' ? `**MANDATORY LYRICS LANGUAGE: ${lyricsLanguage.toUpperCase()}**` : ''}

INSTRUCTIONS:
1. **Analyze Mode Requirements**:
   - IF 'VOCALS': The user provided an instrumental. Focus the 'style' prompt HEAVILY on Vocal Character (Front-loaded), Lyrics, and Emotion. Describe the singer, not the beat (the beat exists). Use terms like "Topline", "Harmony", "Flow".
   - IF 'INSTRUMENTAL': The user provided vocals. Focus the 'style' prompt on the backing track (Genre, Instruments, BPM, Mix).
   - IF 'COVER': The user provided a song to reimagine. Focus the 'style' prompt on the NEW GENRE/VIBE. Treat it as a remix workflow: Keep lyrics but drastically change style descriptors.
   - IF 'INSPIRE': The user provided a playlist. Create a prompt that captures the aggregate vibe of that playlist (based on Intent description).

2. **Construct 'style' field**: Follow the V4.5 Front-Loading Rule. Start with the most important change element.
   - Target 950-990 characters. Use natural descriptive language.

3. **Construct 'tags' field**: Concise, comma-separated.

4. **Lyrics**: 
   - 'VOCALS' mode: Write full lyrics in ${lyricsLanguage && lyricsLanguage !== 'auto' ? lyricsLanguage : 'the intent language'}. Keep lines 6-12 syllables.
     ${isPyriteMode 
       ? `- **LYRICS STYLE (PYRITE)**: Raw, unique, creative, unhinged.` 
       : `- **LYRICS STYLE (STANDARD)**: Professional, rhythmic, polished.`}
   - 'INSTRUMENTAL' mode: Instrumental structure only. Use max 3 bracketed tags per line (e.g. [Intro] [Melodic] [Soft]).
   - 'COVER' mode: Keep structure but adapt vibe descriptors if lyrics are rewritten. Use "Cover" as a de-facto remix/fix pass.

OUTPUT JSON ONLY.
`;

export const GENERATE_EXPERT_PROMPT = (
  userInput: string,
  researchData: string,
  inputs: any,
  structureInstructions: string,
  mood: string,
  lyricsLanguage?: string,
  isPyriteMode?: boolean
): string => `
TASK: EXPERT PROTOCOL GENERATION (VERBOSE v4.5)
INTENT: "${userInput}"
MOOD: ${mood}
RESEARCH: "${researchData.substring(0, 500)}"
GLOBAL VARS: BPM: ${inputs.bpm}, KEY: ${inputs.key}, TIME SIG: ${inputs.timeSignature}, GENRE: ${inputs.genre}, ERA: ${inputs.era}
${lyricsLanguage && lyricsLanguage !== 'auto' ? `**MANDATORY LYRICS LANGUAGE: ${lyricsLanguage.toUpperCase()}**` : ''}

MANDATORY STRUCTURE:
${structureInstructions}

INSTRUCTIONS (Chain-of-Thought):
1.  **Analyze**: Synthesize all inputs into a cohesive sonic vision.
2.  **Construct 'style' field**: Write an extremely descriptive style prompt using natural language.
    - **CRITICAL**: Front-load the Genre, Mood, and Vocals. Start with: "${inputs.genre || 'GENRE'} ${mood} ${inputs.vocalStyle || ''}...".
    - Follow the V4.5 Ordering Rule: [Genre/Mood/Vocals] -> [Instrument Tones] -> [Rhythm] -> [Production/Cleanup].
    - Incorporate cleanup phrases if high quality is implied (e.g. "no harsh highs").
    - Target 950-990 characters.
3.  **Construct 'tags' field**: Create a lean, comma-separated list of tags (1-2 genres, 1 mood, 2-3 instruments).
4.  **Fill Structure**: Write lyrics that fit the mood and intent into the mandatory structure provided. 
    - **LYRICS LANGUAGE**: ${lyricsLanguage && lyricsLanguage !== 'auto' ? lyricsLanguage.toUpperCase() : 'Detect from Intent'}.
    - Keep lines 6-12 syllables.
    - For Instrumental sections, use [Bracketed Tags] for guidance (max 3 per line).
    ${isPyriteMode 
       ? `- **LYRICS TONE (PYRITE)**: Intense, visceral, creative, loose, emotional.` 
       : `- **LYRICS TONE (STANDARD)**: Commercial, standard phrasing, clear rhymes, polished.`}
5.  **Justify**: Briefly explain your core creative choices in the 'analysis' field.

OUTPUT JSON ONLY.
`;

export const REFINE_PROMPT_TASK = (previousJson: string, instruction: string, lyricsLanguage?: string): string => `
TASK: Refine the previous generation based on user feedback.
PREVIOUS OUTPUT:
${previousJson}

USER INSTRUCTION: "${instruction}"
${lyricsLanguage && lyricsLanguage !== 'auto' ? `**TARGET LANGUAGE SETTING: ${lyricsLanguage.toUpperCase()}**` : ''}

CRITICAL PROTOCOLS:
1. **LYRICS & LANGUAGE**: 
   ${lyricsLanguage && lyricsLanguage !== 'auto' 
     ? `- **LANGUAGE ENFORCEMENT**: The user has explicitly set the language to **${lyricsLanguage}**. If the previous lyrics are NOT in ${lyricsLanguage}, you **MUST TRANSLATE/REWRITE** them to ${lyricsLanguage} now.` 
     : `- **PRESERVATION**: Unless the instruction explicitly mentions 'lyrics', 'words', 'rewrite', or 'language', you MUST PRESERVE the 'lyrics' field from the previous output EXACTLY.`
   }
   - **Remix/Fix**: If the user asks to "Fix mix" or "Cleanup", treat this as a "Cover" operation. Keep lyrics (unless told otherwise) but rewrite the Style prompt with cleanup phrases ("clean snare", "modern mastering", "no artifacts").
   - Do NOT rewrite verses unless asked.

2. **STYLE MODIFICATION**: Focus your changes on the 'style' and 'tags' fields.
   - Ensure Front-Loading is maintained (Genre/Mood/Vocals first).
   - Use natural descriptive language for v4.5 updates.

ACTION:
- Modify ONLY the fields relevant to the instruction.
- If the user says "Make it faster", update Tags/Style with higher BPM. Keep lyrics identical.
- If the user says "Fix artifacts", add cleanup phrases to Style.

OUTPUT JSON ONLY.
`;

export const REFINE_RIFFUSION_PROMPT_TASK = (previousJson: string, instruction: string): string => `
TASK: Refine Riffusion Prompt.
PREVIOUS: ${previousJson}
INSTRUCTION: "${instruction}"

ACTION: Adjust tags/style to match new instruction while keeping technical diffusion format.
OUTPUT JSON ONLY.
`;

export const CRITIC_PROMPT = (draftJson: string): string => `
TASK: QA Check for Suno V4.5+ Compliance.
INPUT: ${draftJson}

CHECKLIST:
1. Are Tags under 1000 chars?
2. Are Lyrics formatted with [Square Brackets] for structure?
3. If Instrumental, are lyrics empty or purely meta-tags?
4. Are there any Markdown code blocks? (Forbidden)
5. **TAG DENSITY**: Are there too many instruments listed in 'tags'? (Max 3 preferred).
6. **FRONT-LOADING**: Does the 'style' field start with Genre/Mood?

OUTPUT JSON: { "pass": boolean, "issues": string[] }
`;

export const REFINER_PROMPT = (draftJson: string, issues: string[]): string => `
TASK: Fix the specific issues in this JSON.
ISSUES: ${JSON.stringify(issues)}
INPUT: ${draftJson}

ACTION: Return the corrected JSON. Keep all other fields intact.
- If Tag Density issue: Remove less important instruments from 'tags' field (keep them in 'style').
- If Front-Loading issue: Move Genre and Mood to the very beginning of the 'style' string.
`;
