import Anthropic from "@anthropic-ai/sdk";

const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
const apiKey =
  process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ||
  process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn(
    "[wanis] WARNING: No Anthropic API key found. " +
    "Set AI_INTEGRATIONS_ANTHROPIC_API_KEY or ANTHROPIC_API_KEY. " +
    "Chat and check-in analysis will return errors until a key is set."
  );
}

export const anthropic = new Anthropic({
  apiKey: apiKey ?? "missing-key",
  ...(baseURL ? { baseURL } : {}),
});
