# Cortex

AI memory and model routing companion for AI agents. Store and search agent context semantically, and route tasks to the best AI model automatically.

## Features

- **Semantic Memory** — Vector-backed storage for agent context. Store, search, update, and browse memories with full-text + semantic search.
- **Model Routing** — Embedding-based task-to-model resolution. Describe a task, get the optimal model. ~50ms, no LLM call needed.
- **3 Built-in Presets** — Cheap (DeepSeek + Gemini Flash Lite), Ideal (balanced mix), Workhorse (Claude Opus 4.6 + Sonnet 4.6)
- **React Dashboard** — Search memories, configure routing presets, test route resolution
- **Optional Auth** — JWT-based authentication, toggle with a single env var

## Quick Start

```bash
# 1. Start Qdrant
docker compose up qdrant -d

# 2. Configure
cp .env.example .env
# Edit .env with your EMBEDDING_API_KEY (OpenAI key for embeddings)

# 3. Install & run
pnpm install
pnpm dev
```

Server runs at `http://localhost:4000/api`, frontend at `http://localhost:5173`.

## API

### Memory

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/memory` | Store new memory |
| `POST` | `/api/memory/search` | Semantic search |
| `GET` | `/api/memory/:id` | Get memory by ID |
| `PATCH` | `/api/memory/:id` | Update memory |
| `DELETE` | `/api/memory/:id` | Soft delete |
| `POST` | `/api/memory/:id/restore` | Restore trashed |
| `GET` | `/api/memory/browse` | Browse with filters |
| `GET` | `/api/memory/stats` | Aggregate stats |

### Routing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/routing/presets` | List all presets |
| `GET` | `/api/routing/presets/:name` | Get preset details |
| `PUT` | `/api/routing/presets/:name` | Create/replace preset |
| `PATCH` | `/api/routing/presets/:name/rules/:slug` | Update rule model |
| `POST` | `/api/routing/resolve` | Resolve task to model |
| `GET` | `/api/routing/active` | Get active preset |
| `PUT` | `/api/routing/active` | Set active preset |

### Example: Route a Task

```bash
curl -X POST http://localhost:4000/api/routing/resolve \
  -H "Content-Type: application/json" \
  -d '{"task_description": "fix a small CSS bug in the sidebar"}'
```

Response:
```json
{
  "ok": true,
  "data": {
    "model": "openrouter/x-ai/grok-code-fast-1",
    "category": "small-bug-fix",
    "category_label": "Small Bug Fixes / Enhancements",
    "confidence": 0.82,
    "preset_used": "ideal",
    "is_skill": false,
    "alternatives": [...]
  }
}
```

### Example: Store a Memory

```bash
curl -X POST http://localhost:4000/api/memory \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The user prefers Tailwind CSS 4 with dark mode",
    "category": "preferences",
    "project": "cortex",
    "tags": ["css", "tailwind"],
    "importance": 7,
    "source": "agent"
  }'
```

## Deployment

### Docker (full)

```bash
docker compose --profile full up
```

### Qdrant Cloud

Set `QDRANT_URL` and `QDRANT_API_KEY` in `.env` to your Qdrant Cloud cluster.

## Tech Stack

- Hono + TypeScript + Node 22
- React 19 + Vite + Tailwind CSS 4
- Qdrant (vector database)
- OpenAI embeddings (text-embedding-3-small)
- pnpm workspace monorepo

## License

MIT
