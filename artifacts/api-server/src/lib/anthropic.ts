import Anthropic from "@anthropic-ai/sdk";

const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
const apiKey =
  process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ||
  process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error(
    "No Anthropic API key found. Set AI_INTEGRATIONS_ANTHROPIC_API_KEY or ANTHROPIC_API_KEY."
  );
}

export const anthropic = new Anthropic({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
});
