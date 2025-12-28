

import { GeneratedPrompt } from "../../../types";

export interface ValidationResult {
  score: number; // 0 to 100
  issues: string[];
  status: 'critical' | 'warning' | 'good' | 'optimal';
  details: { 
    completeness: number;
    specificity: number;
    balance: number;
    coherence: number;
  }
}

/**
 * Evaluates a Riffusion prompt against best practices for diffusion models (Fuzz-1.1).
 * Checks for density, technical terms, and BPM.
 */
export const validateRiffusionPrompt = (prompt: GeneratedPrompt): ValidationResult => {
  const combinedText = `${prompt.tags || ''} ${prompt.style || ''}`.toLowerCase();
  
  const details = {
    completeness: 0,
    specificity: 0,
    balance: 0,
    coherence: 20 // Riffusion prompts are less prone to coherence issues, start high
  };
  const issues: string[] = [];

  // 1. Length & Density Check (Completeness: 30pts)
  const wordCount = combinedText.split(/\s+/).length;
  if (wordCount < 5) {
    issues.push("Too short. Add more descriptors.");
    details.completeness = 5;
  } else if (wordCount < 10) {
    issues.push("Add more detail for better texture.");
    details.completeness = 15;
  } else {
    details.completeness = 30;
  }

  // 2. Comma Density (Balance: 20pts)
  const commaCount = (combinedText.match(/,/g) || []).length;
  if (commaCount < 2) {
    issues.push("Use commas to separate keywords.");
    details.balance = 5;
  } else {
    details.balance = 20;
  }

  // 3. Technical Keywords (Specificity: 30pts)
  const technicalTerms = ['bpm', 'hz', 'synth', 'bass', 'kick', 'reverb', 'distorted', 'sawtooth', 'square', 'noise', 'lo-fi', '808', '909', '303'];
  const techCount = technicalTerms.filter(term => combinedText.includes(term)).length;
  
  if (techCount === 0) {
    issues.push("Missing technical terms (e.g. '808', 'reverb').");
    details.specificity = 5;
  } else if (techCount < 2) {
    details.specificity = 15;
  } else {
    details.specificity = 30;
  }
  
  if (!combinedText.includes('bpm')) {
    issues.push("Missing BPM. Define tempo (e.g. '120 bpm').");
    details.specificity = Math.max(0, details.specificity - 10); // Punish missing BPM
  }
  
  const score = details.completeness + details.specificity + details.balance + details.coherence;

  // Determine Status
  let status: ValidationResult['status'] = 'optimal';
  if (score < 50) status = 'critical';
  else if (score < 80) status = 'warning';
  else if (score < 95) status = 'good';

  return { score, issues, status, details };
};