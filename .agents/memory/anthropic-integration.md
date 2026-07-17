---
name: Anthropic integration
description: How the Anthropic SDK is wired — Replit AI integration, not a bare API key.
---

The project uses Replit AI Integrations for Anthropic, not the user's own ANTHROPIC_API_KEY (that key has zero credits).

**Why:** User's personal Anthropic key had no balance; switched to Replit-managed integration billed to Replit credits.

**How to apply:**
- Client is at `artifacts/api-server/src/lib/anthropic.ts`
- It reads `AI_INTEGRATIONS_ANTHROPIC_API_KEY` first, falling back to `ANTHROPIC_API_KEY`
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` must be set for the proxy to work
- Both env vars are set as Replit secrets (set via `setupReplitAIIntegrations({ providerSlug: "anthropic" })`)
- Model in use: `claude-sonnet-4-6` — this is valid through the Replit proxy
- Do NOT call `setupReplitAIIntegrations` again unless the secrets are missing; it requires phone verification
