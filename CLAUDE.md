# Cortex

AI memory and model routing companion for AI agents.

## Quick Start

```bash
docker compose up qdrant    # Start Qdrant
cp .env.example .env        # Configure env
pnpm install                # Install deps
pnpm dev                    # Start server + frontend
```

## Tech Stack

- **Backend**: Hono + TypeScript (Node 22, ES modules)
- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Storage**: Qdrant (vector database)
- **Embeddings**: OpenAI text-embedding-3-small (1536 dims)
- **Package Manager**: pnpm workspace monorepo

## Project Structure

- `packages/shared/` — Shared types + constants
- `packages/server/` — Hono API server (port 4000)
- `packages/web/` — React SPA (dev port 5173, proxied to server)

## Key Patterns

- Singleton Qdrant client in `services/qdrant.ts`
- Embedding-based routing resolution (no LLM call, ~50ms)
- Deterministic point IDs for preset metadata and rules
- Optional JWT auth (toggle via AUTH_ENABLED env)
- 3 built-in routing presets: cheap, ideal, workhorse

## API Base: `/api`

- `POST /api/memory` — Store memory
- `POST /api/memory/search` — Semantic search
- `POST /api/routing/resolve` — Route task to model
- `GET /api/health` — Health check

## Commands

- `pnpm dev` — Dev server + frontend
- `pnpm build` — Build all packages
- `pnpm test` — Run all tests (all packages)
- `pnpm seed` — Seed routing presets
- `pnpm typecheck` — Type check all packages
- `pnpm lint` — Lint all packages
- `pnpm lint:fix` — Lint + auto-fix

## Testing

- **Framework**: Vitest 4 + @testing-library/react + jsdom
- **Web tests**: `packages/web/tests/` — mirrors `src/` structure
- Run web tests: `pnpm --filter @cortex/web test`
- Run in watch mode: `pnpm --filter @cortex/web test:watch`
- Run with coverage: `pnpm --filter @cortex/web test:ci`
- Config: `packages/web/vitest.config.ts`
- Setup: `packages/web/tests/setup.ts` (jest-dom matchers + localStorage mock)

## Build Script

`build.sh` or `build.ps1` — Full CI-style pipeline that runs in order:

1. Clean (`node_modules`, `package-lock.json`, `tsconfig.tsbuildinfo`)
2. `pnpm install --frozen-lockfile` (falls back to `--no-frozen-lockfile`)
3. Typecheck (`pnpm typecheck`)
4. Lint (`pnpm lint`, auto-fixes if possible)
5. Test (`pnpm test`)
6. Build (`pnpm build`)
