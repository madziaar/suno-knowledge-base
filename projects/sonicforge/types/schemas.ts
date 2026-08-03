import { z } from "zod";
import { LIMITS } from "../lib/constants";

/**
 * Zod Schema for AI Response Validation.
 * Defines the strict shape the AI must adhere to.
 * Hardened to handle explicit nulls and coerce types.
 */
export const GeneratedPromptSchema = z.object({
  title: z.string().nullish().default('').transform(v => v ? v.substring(0, LIMITS.TITLE) : ""),
  tags: z.string().nullish().default('').transform(v => v ? v.substring(0, LIMITS.TAGS) : ""),
  style: z.string().nullish().default('').transform(v => v ? v.substring(0, LIMITS.STYLE) : ""),
  lyrics: z.string().nullish().default('').transform(v => v ? v.substring(0, LIMITS.LYRICS) : ""),
  analysis: z.string().nullish().default(''),
  modelUsed: z.string().optional(),
});

export const VariationsSchema = z.array(GeneratedPromptSchema);
