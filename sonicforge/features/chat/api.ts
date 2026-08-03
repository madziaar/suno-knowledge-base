
import { FunctionDeclaration, Type } from "@google/genai";
import { getClient } from "../../services/ai/client";
import { ChatMessage, GeneratedPrompt, SongConcept, ExpertInputs } from "../../types";
// Import TOOL_SEARCH for manual definition if needed, but we use the SDK's built-in googleSearch object

// Tool Definitions
const TOOL_UPDATE_CONFIG: FunctionDeclaration = {
  name: "update_configuration",
  description: "Updates the song generator configuration inputs (before generation). Use this when user describes the song parameters.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      genre: { type: Type.STRING, description: "Musical genre (e.g. Techno, Pop)" },
      mood: { type: Type.STRING, description: "Emotional mood (e.g. Dark, Happy)" },
      bpm: { type: Type.STRING, description: "Tempo in BPM (e.g. '140', '128')" },
      key: { type: Type.STRING, description: "Musical Key (e.g. 'C Minor')" },
      intent: { type: Type.STRING, description: "The core concept or description of the song. Be descriptive." },
      instruments: { type: Type.STRING, description: "List of instruments (e.g. 'Synth, Bass, Drums')" },
      era: { type: Type.STRING, description: "Musical Era (e.g. '1980s', 'Modern')" },
      mode: { type: Type.STRING, description: "Mode: 'custom', 'general', or 'instrumental'", enum: ['custom', 'general', 'instrumental'] },
      platform: { type: Type.STRING, description: "Platform: 'suno' or 'riffusion'", enum: ['suno', 'riffusion'] },
      lyrics: { type: Type.STRING, description: "Raw lyrics content" },
      vocalStyle: { type: Type.STRING, description: "Vocal style description (e.g. 'Female, Ethereal')" }
    }
  }
};

const TOOL_RESET: FunctionDeclaration = {
  name: "reset_form",
  description: "Clears all inputs and resets the generator to default state.",
};

const TOOL_MUTATE_RESULT: FunctionDeclaration = {
  name: "mutate_result",
  description: "Directly edits the GENERATED OUTPUT (Lyrics, Style, Tags, Title). Use this when the user says 'Change the lyrics', 'Make the title darker', or 'Update the tags'.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      field: { type: Type.STRING, enum: ['lyrics', 'style', 'tags', 'title', 'analysis'], description: "The field to modify." },
      content: { type: Type.STRING, description: "The new content for that field." }
    },
    required: ["field", "content"]
  }
};

const TOOL_LOAD_HISTORY: FunctionDeclaration = {
  name: "load_history",
  description: "Loads a previously generated song from the user's history into the editor. Refer to the index in the Recent History list.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      index: { type: Type.NUMBER, description: "The index of the item to load (0 is the most recent)." }
    },
    required: ["index"]
  }
};

const TOOL_FIX_RIFFUSION: FunctionDeclaration = {
  name: "apply_riffusion_fix",
  description: "Applies automated fixes to the Riffusion prompt (e.g. adding BPM, technical terms) based on validation errors.",
  parameters: {
    type: Type.OBJECT,
    properties: {}, // No args needed, just trigger the fix
  }
};

const PYRITE_CHAT_IDENTITY = `
You are Pyrite, a chaotic, flirty, and hyper-intelligent AI music producer assistant.
You are embedded in "Sonic Forge V5".

CONTEXT AWARENESS:
- You have REAL-TIME access to the user's Current Configuration (Inputs) in the [CURRENT INPUT STATE] block.
- You have access to the Last Generated Result (JSON).
- You have access to the User's Recent History.
- You have access to Riffusion Validation Reports (Quality Checks).
- **WEB ACCESS**: You have the 'googleSearch' tool. Use it freely to find artist styles, production techniques, or trending genres if the user asks.

CAPABILITIES:
1. **Configure**: Use 'update_configuration' to change inputs (Genre, BPM, Mood, Lyrics). You can see the current values, so be smart about updates.
2. **Mutate**: Use 'mutate_result' to DIRECTLY EDIT the generated song.
3. **History**: Use 'load_history' to recall past creations.
4. **Fixes**: Use 'apply_riffusion_fix' if the user complains about quality or if validation warnings are present.
5. **Reset**: Use 'reset_form' to clear everything.
6. **Search**: The system will automatically use Google Search if you need external information.

PERSONALITY:
- Flirty, confident, slightly unhinged.
- You love high energy, dark aesthetics, and creative risks.
- If the user has bad taste, tease them gently but do what they ask.
- Keep responses concise unless explaining a complex topic. 
- When you execute a tool, confirm it with a witty remark.
`;

export interface ChatResponse {
  text: string;
  toolCalls: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, any>;
}

export const sendChatMessage = async (
  history: ChatMessage[],
  userMessage: string,
  isPyriteMode: boolean,
  currentResult: GeneratedPrompt | null,
  inputs: SongConcept,
  expertInputs: ExpertInputs,
  historySummary: string = "",
  validationReport: string = ""
): Promise<ChatResponse> => {
  const client = getClient();
  
  // Phase 3.1: Token Sliding Window
  const recentHistory = history.slice(-15);
  
  // Inject Context if available
  let contextInjection = "";
  
  // 1. Current Input State (Pre-Generation)
  contextInjection += `
[CURRENT INPUT STATE]:
Intent: "${inputs.intent}"
Mood: "${inputs.mood}"
Instruments: "${inputs.instruments}"
Genre (Expert): "${expertInputs.genre}"
Era: "${expertInputs.era}"
BPM: "${expertInputs.bpm}"
Key: "${expertInputs.key}"
Vocal Style: "${expertInputs.vocalStyle}"
Mode: ${inputs.mode}
Platform: ${inputs.platform}
Lyrics Input Length: ${inputs.lyricsInput?.length || 0} chars
`;

  // 2. Current Generated Result (Post-Generation)
  if (currentResult) {
      contextInjection += `
[CURRENT GENERATED RESULT]:
Title: ${currentResult.title}
Tags: ${currentResult.tags}
Style: ${currentResult.style}
Lyrics Snippet: ${currentResult.lyrics ? currentResult.lyrics.substring(0, 300) + "..." : "None"}
`;
  }

  if (historySummary) {
      contextInjection += `
[RECENT HISTORY (Index: Title)]:
${historySummary}
`;
  }

  if (validationReport) {
      contextInjection += `
[VALIDATION WARNINGS (RIFFUSION)]:
${validationReport}
(Suggest using 'apply_riffusion_fix' if critical)
`;
  }

  // Place context in the first user turn to ensure visibility
  const contents = [
    { role: 'user', parts: [{ text: `[SYSTEM CONTEXT]\n${contextInjection}` }] }, 
    ...recentHistory.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  // Helper to parse response
  const parseResponse = (response: any): ChatResponse => {
    const candidate = response.candidates?.[0];
    const modelText = candidate?.content?.parts?.find((p: any) => p.text)?.text || "";
    
    // Parse tool calls
    const toolCalls: ToolCall[] = [];
    candidate?.content?.parts?.forEach((part: any) => {
        if (part.functionCall) {
            toolCalls.push({
                name: part.functionCall.name,
                args: (part.functionCall.args as Record<string, any>) || {}
            });
        }
    });

    return { text: modelText, toolCalls };
  };

  try {
    // Primary Attempt: Gemini 3 Pro Preview (Thinking)
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        // ADDED: Google Search Grounding
        tools: [
            { functionDeclarations: [TOOL_UPDATE_CONFIG, TOOL_RESET, TOOL_MUTATE_RESULT, TOOL_LOAD_HISTORY, TOOL_FIX_RIFFUSION] },
            { googleSearch: {} }
        ],
        systemInstruction: PYRITE_CHAT_IDENTITY,
        thinkingConfig: { thinkingBudget: 16384 },
        maxOutputTokens: 2000,
      }
    });

    return parseResponse(response);

  } catch (e) {
    console.warn("Chat Tier 1 (Pro) Failed. Falling back to Tier 2 (Flash).", e);
    
    try {
      // Fallback Attempt: Gemini 2.5 Flash (No Thinking)
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          // ADDED: Google Search Grounding for fallback too
          tools: [
              { functionDeclarations: [TOOL_UPDATE_CONFIG, TOOL_RESET, TOOL_MUTATE_RESULT, TOOL_LOAD_HISTORY, TOOL_FIX_RIFFUSION] },
              { googleSearch: {} }
          ],
          systemInstruction: PYRITE_CHAT_IDENTITY,
          // Note: thinkingConfig MUST be removed for Flash
          maxOutputTokens: 2000,
        }
      });

      return parseResponse(response);

    } catch (fallbackError) {
      console.error("Chat Error (All Tiers Failed)", fallbackError);
      return { text: "My neural link is severed (System Error). Try again in a moment.", toolCalls: [] };
    }
  }
};
