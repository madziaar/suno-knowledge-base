
import { HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/genai";
// Fixed: Added PYRITE_SIGNATURE_DNA to imports from prompts
import { getSystemInstruction, EXPERT_RULES_BLOCK, SYNTAX_BLOCK, IDENTITY_BLOCKS, CONSTRAINTS_BLOCK, NEGATIVE_CONSTRAINTS_BLOCK, REASONING_BLOCK, PYRITE_SIGNATURE_DNA } from "./prompts";
import { getHighImpactTagsString } from "../../data";

// Define Safety Settings
export const SAFETY_SETTINGS: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE }
];

export const TAG_DATABASE = getHighImpactTagsString();

// Re-export for backward compatibility
// Fixed: Added PYRITE_SIGNATURE_DNA to exports
export { getSystemInstruction, PYRITE_SIGNATURE_DNA };

// Inject Reasoning Block into Identities for safety
export const STANDARD_IDENTITY = IDENTITY_BLOCKS.STANDARD + REASONING_BLOCK + CONSTRAINTS_BLOCK + NEGATIVE_CONSTRAINTS_BLOCK;
export const CHAOS_IDENTITY = IDENTITY_BLOCKS.CHAOS + REASONING_BLOCK + CONSTRAINTS_BLOCK + NEGATIVE_CONSTRAINTS_BLOCK;

// Expert mode inherits the modular blocks + extra syntax rules
export const EXPERT_SYSTEM_PROMPT = `
You are a Suno v5 Architecture Specialist.

${SYNTAX_BLOCK}

${NEGATIVE_CONSTRAINTS_BLOCK}

${EXPERT_RULES_BLOCK}
`;