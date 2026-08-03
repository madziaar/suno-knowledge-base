
import { getSystemInstruction, EXPERT_RULES_BLOCK, SYNTAX_BLOCK, IDENTITY_BLOCKS, CONSTRAINTS_BLOCK, NEGATIVE_CONSTRAINTS_BLOCK, REASONING_BLOCK } from "./prompts/system";
import { getHighImpactTagsString } from "../../features/generator/data/sunoMetaTags";

// Safety settings are no longer needed for NVIDIA NIM API
// The API handles content filtering server-side

export const TAG_DATABASE = getHighImpactTagsString();

// Re-export for backward compatibility
export { getSystemInstruction };

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
