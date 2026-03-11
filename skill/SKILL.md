---
name: cortex
description: AI memory storage/retrieval and model routing via Cortex API. Store memories, search semantically, and resolve tasks to optimal models.
homepage: https://github.com/ggoodwin/cortex
metadata: {"clawdbot":{"emoji":"🧠","requires":{"bins":["node"]}}}
---

# Cortex

AI memory and model routing companion. Store/search agent memories and resolve tasks to optimal models.

## Remember (store a memory)

```bash
node {baseDir}/scripts/cortex.mjs remember --content "The user prefers dark mode" --category preferences --project myproject
node {baseDir}/scripts/cortex.mjs remember --content "Fixed bug in auth middleware" --category debugging --project cortex --tags "auth,middleware" --importance 7
```

### Options

- `--content <text>`: Memory content (required)
- `--category <cat>`: Category (required)
- `--project <name>`: Project name (default: "default")
- `--tags <comma,list>`: Tags
- `--importance <1-10>`: Importance (default: 5)
- `--source <agent|user|api>`: Source (default: "agent")

## Recall (search memories)

```bash
node {baseDir}/scripts/cortex.mjs recall "authentication patterns"
node {baseDir}/scripts/cortex.mjs recall "user preferences" --category preferences --project myproject --limit 5
```

### Options

- First arg: Search query (required)
- `--category <cat>`: Filter by category
- `--project <name>`: Filter by project
- `--tags <comma,list>`: Filter by tags
- `--limit <n>`: Max results (default: 10)
- `--min-score <0-1>`: Minimum similarity score (default: 0.3)

## Route (resolve task to model)

```bash
node {baseDir}/scripts/cortex.mjs route "fix a small CSS bug in the sidebar"
node {baseDir}/scripts/cortex.mjs route "design a new database schema" --preset workhorse
```

### Options

- First arg: Task description (required)
- `--preset <name>`: Use specific preset (default: active preset)
