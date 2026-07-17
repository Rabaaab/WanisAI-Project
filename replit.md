# WanisAI

A consent-first AI companion for cognitive health — combining gentle weekly prevention check-ins powered by Claude, a family memory companion, and a dedicated Guardian mode for Hajj/Umrah safety.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/wanis-ai run dev` — run the frontend (proxied at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `ANTHROPIC_API_KEY` — user's own Anthropic API key (never use the Replit integration for this app)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: Anthropic SDK (`@anthropic-ai/sdk`) with `ANTHROPIC_API_KEY`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (one file per entity)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/anthropic.ts` — Anthropic client (uses ANTHROPIC_API_KEY)
- `artifacts/wanis-ai/src/` — React frontend (pages, components, hooks)

## Design System

**Exact palette:**
- Background: cream `#F6F1E7`
- Secondary surfaces/cards: soft blue tint `#E4ECF2`
- Gold `#C9A227` — primary accent (buttons, highlights, active states)
- Trust blue `#5B84AC` — main-mode interactive elements
- Deep navy `#2B3E50` — accent only (text, icons, thin borders, never large fills)
- **Guardian mode** (Hajj/Umrah page only): deep green `#2F6D4F` as primary, sage `#7A8B6F` secondary, forest `#1F4A36` accent

## Product

- **Onboarding/consent**: Multi-step profile setup with explicit, clear consent language — the user sets up while lucent, choosing who can access data if memory changes
- **Prevention mode** (blue): Weekly text reflection → Claude analysis → mood/social signal tracking vs. personal baseline → one concrete action suggestion. Never claims diagnosis.
- **Guardian mode** (green): Pilgrim safety profile (photo, hotel, group leader, medical notes) for Hajj/Umrah travel. Includes prominent disclaimer about complementing official safety systems.
- **Memory companion**: Large photo cards of family members for "who is this?" moments. Calm, uncluttered.
- **AI Companion**: Free-form chat with Claude as a warm, caring companion.

## Architecture decisions

- Single-user app (no auth) — profile, guardian profile are singletons (GET returns first row, PUT upserts)
- Claude check-in analysis is streamed via SSE for a calm, progressive reveal effect
- Guardian mode visual swap done via CSS class on the page wrapper, not a separate theme system
- ANTHROPIC_API_KEY used directly (user-provided key) — not Replit AI Integrations

## User preferences

- Store Anthropic API key as `ANTHROPIC_API_KEY` Replit secret — never hardcoded

## Gotchas

- After any `lib/*` schema change, run `pnpm run typecheck:libs` before checking artifact packages
- The `/check-ins/:id/analyze` and `/anthropic/conversations/:id/messages` endpoints return SSE streams — consume with raw `fetch` + `ReadableStream`, NOT generated hooks
- `pnpm --filter @workspace/db run push-force` if push fails with column conflicts

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
