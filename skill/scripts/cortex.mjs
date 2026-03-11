#!/usr/bin/env node

const BASE = process.env.CORTEX_URL || "http://localhost:4000/api";
const TOKEN = process.env.CORTEX_TOKEN || "";

const args = process.argv.slice(2);
const command = args[0];

function getFlag(name) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  return args[i + 1];
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (!json.ok) {
    console.error(`Error: ${json.error}`);
    process.exit(1);
  }
  return json.data;
}

async function remember() {
  const content = getFlag("content");
  if (!content) {
    console.error('Usage: cortex.mjs remember --content "..." --category <cat> [options]');
    process.exit(1);
  }

  const body = {
    content,
    category: getFlag("category") || "general",
    project: getFlag("project") || "default",
    tags:
      getFlag("tags")
        ?.split(",")
        .map(t => t.trim()) || [],
    importance: parseInt(getFlag("importance") || "5", 10),
    source: getFlag("source") || "agent"
  };

  const data = await request("/memory", {
    method: "POST",
    body: JSON.stringify(body)
  });

  console.log(JSON.stringify({ stored: true, id: data.id }, null, 2));
}

async function recall() {
  const query = args[1];
  if (!query || query.startsWith("--")) {
    console.error('Usage: cortex.mjs recall "query" [options]');
    process.exit(1);
  }

  const body = {
    query,
    limit: parseInt(getFlag("limit") || "10", 10),
    min_score: parseFloat(getFlag("min-score") || "0.3")
  };

  const category = getFlag("category");
  const project = getFlag("project");
  const tags = getFlag("tags");
  if (category) body.category = category;
  if (project) body.project = project;
  if (tags) body.tags = tags.split(",").map(t => t.trim());

  const data = await request("/memory/search", {
    method: "POST",
    body: JSON.stringify(body)
  });

  const results = data.map(m => ({
    id: m.id,
    content: m.content,
    category: m.category,
    project: m.project,
    score: m.score,
    importance: m.importance,
    tags: m.tags
  }));

  console.log(JSON.stringify(results, null, 2));
}

async function route() {
  const task = args[1];
  if (!task || task.startsWith("--")) {
    console.error('Usage: cortex.mjs route "task description" [--preset name]');
    process.exit(1);
  }

  const body = { task_description: task };
  const preset = getFlag("preset");
  if (preset) body.preset = preset;

  const data = await request("/routing/resolve", {
    method: "POST",
    body: JSON.stringify(body)
  });

  console.log(JSON.stringify(data, null, 2));
}

switch (command) {
  case "remember":
    await remember();
    break;
  case "recall":
    await recall();
    break;
  case "route":
    await route();
    break;
  default:
    console.error("Usage: cortex.mjs <remember|recall|route> [options]");
    console.error("");
    console.error("Commands:");
    console.error("  remember  Store a new memory");
    console.error("  recall    Search memories semantically");
    console.error("  route     Resolve a task to a model");
    process.exit(1);
}
