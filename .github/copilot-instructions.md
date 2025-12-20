# OfferAnalyst – Copilot Playbook

## Architecture & Data Flow
- Next.js App Router with a single dashboard route in [src/app/page.tsx](../src/app/page.tsx); the shell lives in [src/app/layout.tsx](../src/app/layout.tsx) and wraps all pages in the `ThemeProvider`.
- UI state is orchestrated through custom hooks in [src/hooks](../src/hooks); keep business logic out of components and extend the hooks instead.
- The analysis pipeline runs entirely through server actions in [src/app/actions](../src/app/actions): `fetch.ts` (retrieval), `analyze.ts` (ranking), and `organize.ts` (post-processing).
- Client hooks such as `useOfferAnalysis` trigger those actions, manage loading/auto-fetch toggles, and surface provider errors to the UI.
- Types shared between client and server sit in [src/types/index.ts](../src/types/index.ts); add any new contract there and reuse the Zod schemas for runtime validation.

## AI & Server Actions
- All AI calls go through OpenRouter SDK; make sure `OPENROUTER_API_KEY` is defined in `.env.local`. The legacy `GEMINI_API_KEY` mention in the README is outdated.
- Use `parseJSONFromText`, `validateWithZod`, `retryWithBackoff`, and `toAgentActionError` from [src/app/actions/shared/agent-utils.ts](../src/app/actions/shared/agent-utils.ts) for every server action—this guarantees consistent parsing, validation, retries, and error envelopes.
- `fetchOffersAction` returns plain `Offer[]`, `analyzeOffersAction` returns `AnalysisResponse` (top offers + market summary + sources), and `organizeOffersAction` produces categorized timelines; keep payloads slim (truncate long descriptions) before sending to the model, then rehydrate with the originals.
- When you add a new action, declare its schema with Zod, parse + validate AI output, and return the discriminated `AgentActionResult` shape so the client can branch on `success`.
- Respect the `selectedModel` parameter threaded from `useDashboardState`; model metadata lives in [src/lib/ai-models.ts](../src/lib/ai-models.ts).

## State, Persistence & UX Hooks
- Dashboard defaults (domain, criteria, implicit context, offers JSON, auto-fetch flag, limit, selected model) persist to `localStorage` via [use-dashboard-state](../src/hooks/use-dashboard-state.ts); read/write is gated behind `useEffect` guards to avoid hydration issues—follow that pattern for future persisted state.
- Saved offers (`use-saved-offers`), search history (`use-search-history`), and restore-on-navigation (`use-restore-search`) all interact with web storage; only call them inside `"use client"` modules.
- `useOfferAnalysis` composes the full workflow: optional fetch, required analyze, history persistence, error propagation to `ProviderErrorPanel`. Extend or branch the workflow here rather than inside components.

## UI Composition
- Layout pieces reside in [src/components/layout](../src/components/layout); offer-centric widgets live in [src/components/offers](../src/components/offers) (e.g., `ConfigurationCard`, `ResultsSection`, `ScoreChart`). Favor these building blocks before introducing new primitives.
- Reusable UI primitives are under [src/components/ui](../src/components/ui) (shadcn). Maintain styling parity with Tailwind v4 utilities already used in [src/app/globals.css](../src/app/globals.css).

## Developer Workflow
- Use pnpm scripts: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`. No custom test runner exists yet.
- Tailwind is configured via `@tailwindcss/postcss` v4; arbitrary class names are resolved at build time, so keep styles declarative.
- When debugging AI responses, log output sparingly—server actions already emit parse + attempt logs; too much noise triggers rate limits quickly.

## Knowledge Base & TODOs
- Architectural context and outstanding AI-agent work (e.g., modernizing `fetchOffersAction`) live in [docs/README.md](../docs/README.md) plus the other docs in `docs/`; consult before altering prompts or schemas.
- Prefer updating these docs (and this playbook) whenever you adjust agent prompts, schema contracts, or storage conventions.


## Typescript Guidelines
- Follow strict typing conventions; avoid using `any` or `unknown` without proper type guards.
- Leverage existing types in [src/types/index.ts](../src/types/index.ts) to maintain consistency across the codebase.
- When defining new types or interfaces, ensure they are well-documented and follow the existing naming conventions.
- Use Zod schemas for runtime validation of data structures, especially for AI responses and external data.
- Ensure all functions and methods have explicit return types for better readability and maintainability.
- avoid deeply nested types; consider breaking them down into smaller, reusable types or interfaces.
- avoid using `any` type; prefer `unknown` with proper type narrowing.