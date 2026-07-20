import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "[wanis] ERROR: No Gemini API key found. " +
    "Set GEMINI_API_KEY in the environment."
  );
}

export const gemini = new GoogleGenAI({ apiKey: apiKey || "" });

export function isGeminiConfigured(): boolean {
  return !!apiKey;
}
