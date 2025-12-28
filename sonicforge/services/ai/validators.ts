
import { GeneratedPrompt, SongConcept } from "../../types";
import { GeneratedPromptSchema } from "../../types";
import { LIMITS } from "../../lib/constants";

const TAG_CORRECTIONS: Record<string, string> = {
  'fast pace': 'fast tempo',
  'slow pace': 'slow tempo',
  'female voice': 'female vocals',
  'male voice': 'male vocals',
  'instrumental only': 'instrumental',
  'synth pop': 'synthpop',
  'hip-hop': 'hip hop',
  'lo fi': 'lo-fi',
  'high quality': 'pristine production',
  'emotional': 'emotional vocals',
  'heavy bass': 'sub bass',
  'synthesizer': 'synth',
  'drum machine': 'drum machine',
  'acoustic guitar': 'acoustic guitar',
  'electric guitar': 'electric guitar',
  'upbeat': 'energetic',
  'sad': 'melancholic'
};

export const validateAIResponse = (json: any, inputs?: SongConcept): GeneratedPrompt => {
  try {
    const parsed = GeneratedPromptSchema.parse(json);
    let tags = validateAndFixTags(parsed.tags);
    let style = (parsed.style || '').substring(0, LIMITS.STYLE);

    // VOCAL GENDER GUARD REMOVED - User has full control.
    
    return {
      title: (parsed.title || "Untitled").substring(0, LIMITS.TITLE),
      tags: validateAndFixTags(tags),
      style: style,
      lyrics: sanitizeLyrics(parsed.lyrics).substring(0, LIMITS.LYRICS),
      analysis: parsed.analysis || '',
    };
  } catch (error) {
    console.warn("AI Response Validation Failed:", error);
    return {
      title: String(json?.title ?? "Validation Error").substring(0, LIMITS.TITLE),
      tags: validateAndFixTags(String(json?.tags ?? "")),
      style: String(json?.style ?? "").substring(0, LIMITS.STYLE),
      lyrics: sanitizeLyrics(String(json?.lyrics ?? "")).substring(0, LIMITS.LYRICS),
      analysis: String(json?.analysis ?? "Error parsing model output."),
    };
  }
};

export const validateAndFixTags = (rawTags: string): string => {
  if (!rawTags) return "";

  const uniqueTags = new Set<string>();
  const parts = rawTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);

  parts.forEach(tag => {
    let cleanTag = tag.replace(/\.$/, '');
    if (TAG_CORRECTIONS[cleanTag]) {
      cleanTag = TAG_CORRECTIONS[cleanTag];
    }
    uniqueTags.add(cleanTag);
  });

  const result = Array.from(uniqueTags).join(', ');

  if (result.length > LIMITS.TAGS) {
    return result.substring(0, LIMITS.TAGS).replace(/,[^,]*$/, '');
  }

  return result;
};

export const sanitizeLyrics = (text: string): string => {
  if (!text) return "";
  
  let sanitized = text;

  // 1. Fix structural tags in parentheses: (Chorus) -> [Chorus]
  sanitized = sanitized.replace(/\((intro|verse|chorus|bridge|outro|instrumental|solo|drop|build|pre-chorus|hook|breakdown)\)/gi, '[$1]');
  
  // 2. Normalize V4.5 Pipe Operator spacing: [Chorus|Anthemic] -> [Chorus | Anthemic]
  sanitized = sanitized.replace(/\[([^\]|]+)\|([^\]]+)\]/g, (match, p1, p2) => {
      return `[${p1.trim()} | ${p2.trim()}]`;
  });

  // 3. Enforce the Power Ending
  const lower = sanitized.toLowerCase();
  const hasFade = lower.includes('[instrumental fade out]') || lower.includes('fade out');
  const hasEnd = lower.includes('[end]');

  if (!hasEnd) {
      if (hasFade) {
          sanitized += "\n[End]";
      } else {
          sanitized += "\n[Instrumental Fade Out]\n[End]";
      }
  }

  return sanitized;
};
