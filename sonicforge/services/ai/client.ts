
import OpenAI from "openai";

// Base client factory with validation for NVIDIA NIM
export const getClient = () => {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.NIM_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: NVIDIA_API_KEY or NIM_API_KEY is missing from environment variables.");
    throw new Error("Configuration Error: NVIDIA API Key missing.");
  }
  return new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey
  });
};
