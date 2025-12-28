
import { GoogleGenAI } from "@google/genai";

// Base client factory with validation
export const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: API_KEY is missing from environment variables.");
    throw new Error("Configuration Error: API Key missing.");
  }
  return new GoogleGenAI({ apiKey });
};
