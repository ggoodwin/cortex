import type {
  RoutingPreset,
  RoutingPresetPayload,
  RoutingResolveInput,
  RoutingResolveResult,
  RoutingRule,
  RoutingRulePayload
} from "@cortex/shared";
import { COLLECTIONS } from "@cortex/shared";
import { config } from "../config.js";
import { BUILTIN_PRESETS } from "../seed/presets.js";
import { generateEmbedding } from "./embeddings.js";
import { deletePoint, getPoint, scrollPoints, searchPoints, updatePayload, upsertPoint } from "./qdrant.js";

const COL = COLLECTIONS.ROUTING;

// Deterministic ID for preset metadata points
function presetMetaId(name: string): string {
  // Use a predictable UUID-like format based on preset name
  const hex = Buffer.from(name.padEnd(16, "\0")).toString("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// Deterministic ID for a rule point
function rulePointId(preset: string, slug: string): string {
  const combined = `${preset}:${slug}`;
  const hex = Buffer.from(combined.padEnd(16, "\0")).toString("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-b${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function seedPresets(): Promise<void> {
  const zeroVector = new Array(config.embedding.dimensions).fill(0);

  for (const preset of BUILTIN_PRESETS) {
    const metaId = presetMetaId(preset.name);
    const existing = await getPoint(COL, metaId);

    // Only seed if not already present
    if (existing) continue;

    const now = new Date().toISOString();
    const metaPayload: RoutingPresetPayload = {
      _type: "preset_meta",
      name: preset.name,
      label: preset.label,
      description: preset.description,
      is_active: preset.name === "ideal", // Default active
      is_builtin: true,
      created_at: now,
      updated_at: now
    };

    await upsertPoint(COL, metaId, zeroVector, metaPayload as unknown as Record<string, unknown>);

    // Seed each rule with its category description embedding
    for (const rule of preset.rules) {
      const ruleId = rulePointId(preset.name, rule.category_slug);
      let vector: number[];
      try {
        vector = await generateEmbedding(rule.category_description);
      } catch {
        // If embedding fails (no API key), use zero vector
        vector = zeroVector;
      }

      const rulePayload: RoutingRulePayload = {
        preset_name: preset.name,
        category_slug: rule.category_slug,
        category_label: rule.category_label,
        category_description: rule.category_description,
        model: rule.model,
        is_skill: rule.is_skill,
        priority: rule.priority,
        created_at: now,
        updated_at: now
      };

      await upsertPoint(COL, ruleId, vector, rulePayload as unknown as Record<string, unknown>);
    }

    console.log(`  Seeded preset: ${preset.name} (${preset.rules.length} rules)`);
  }
}

export async function listPresets(): Promise<RoutingPreset[]> {
  const result = await scrollPoints(
    COL,
    {
      must: [{ key: "_type", match: { value: "preset_meta" } }]
    },
    100
  );

  const presets: RoutingPreset[] = [];
  for (const point of result.points) {
    const meta = point.payload as unknown as RoutingPresetPayload;
    const rules = await getRulesForPreset(meta.name);
    presets.push({
      name: meta.name,
      label: meta.label,
      description: meta.description,
      is_active: meta.is_active,
      is_builtin: meta.is_builtin,
      rules
    });
  }

  return presets;
}

export async function getPreset(name: string): Promise<RoutingPreset | null> {
  const metaId = presetMetaId(name);
  const point = await getPoint(COL, metaId);
  if (!point) return null;

  const meta = point.payload as unknown as RoutingPresetPayload;
  const rules = await getRulesForPreset(name);

  return {
    name: meta.name,
    label: meta.label,
    description: meta.description,
    is_active: meta.is_active,
    is_builtin: meta.is_builtin,
    rules
  };
}

async function getRulesForPreset(presetName: string): Promise<RoutingRule[]> {
  const result = await scrollPoints(
    COL,
    {
      must: [{ key: "preset_name", match: { value: presetName } }],
      must_not: [{ key: "_type", match: { value: "preset_meta" } }]
    },
    100
  );

  return result.points
    .map(p => {
      const r = p.payload as unknown as RoutingRulePayload;
      return {
        category_slug: r.category_slug,
        category_label: r.category_label,
        category_description: r.category_description,
        model: r.model,
        is_skill: r.is_skill,
        priority: r.priority
      };
    })
    .sort((a, b) => a.priority - b.priority);
}

export async function getActivePresetName(): Promise<string> {
  const result = await scrollPoints(
    COL,
    {
      must: [
        { key: "_type", match: { value: "preset_meta" } },
        { key: "is_active", match: { value: true } }
      ]
    },
    1
  );

  if (result.points.length === 0) return "ideal";
  return (result.points[0].payload as unknown as RoutingPresetPayload).name;
}

export async function setActivePreset(name: string): Promise<boolean> {
  const target = await getPoint(COL, presetMetaId(name));
  if (!target) return false;

  // Deactivate all presets
  const all = await scrollPoints(
    COL,
    {
      must: [{ key: "_type", match: { value: "preset_meta" } }]
    },
    100
  );

  for (const p of all.points) {
    await updatePayload(COL, String(p.id), { is_active: false });
  }

  // Activate the target
  await updatePayload(COL, presetMetaId(name), { is_active: true });
  return true;
}

export async function updateRule(
  presetName: string,
  categorySlug: string,
  updates: { model?: string }
): Promise<boolean> {
  const ruleId = rulePointId(presetName, categorySlug);
  const point = await getPoint(COL, ruleId);
  if (!point) return false;

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.model !== undefined) {
    payload.model = updates.model;
    payload.is_skill = updates.model.startsWith("skill:");
  }

  await updatePayload(COL, ruleId, payload);
  return true;
}

export async function createOrReplacePreset(
  name: string,
  input: { label: string; description: string; rules: RoutingRule[] }
): Promise<RoutingPreset> {
  const now = new Date().toISOString();
  const zeroVector = new Array(config.embedding.dimensions).fill(0);

  // Delete existing rules for this preset
  const existing = await scrollPoints(
    COL,
    {
      must: [{ key: "preset_name", match: { value: name } }]
    },
    200
  );
  for (const p of existing.points) {
    await deletePoint(COL, String(p.id));
  }

  // Also delete the old meta point
  try {
    await deletePoint(COL, presetMetaId(name));
  } catch {
    /* may not exist */
  }

  // Create meta
  const metaPayload: RoutingPresetPayload = {
    _type: "preset_meta",
    name,
    label: input.label,
    description: input.description,
    is_active: false,
    is_builtin: false,
    created_at: now,
    updated_at: now
  };
  await upsertPoint(COL, presetMetaId(name), zeroVector, metaPayload as unknown as Record<string, unknown>);

  // Create rules
  for (const rule of input.rules) {
    const ruleId = rulePointId(name, rule.category_slug);
    let vector: number[];
    try {
      vector = await generateEmbedding(rule.category_description);
    } catch {
      vector = zeroVector;
    }

    const rulePayload: RoutingRulePayload = {
      preset_name: name,
      category_slug: rule.category_slug,
      category_label: rule.category_label,
      category_description: rule.category_description,
      model: rule.model,
      is_skill: rule.is_skill ?? rule.model.startsWith("skill:"),
      priority: rule.priority,
      created_at: now,
      updated_at: now
    };

    await upsertPoint(COL, ruleId, vector, rulePayload as unknown as Record<string, unknown>);
  }

  return { ...metaPayload, rules: input.rules, is_active: false, is_builtin: false };
}

export async function resolveRoute(input: RoutingResolveInput): Promise<RoutingResolveResult> {
  const presetName = input.preset ?? (await getActivePresetName());
  const vector = await generateEmbedding(input.task_description);

  const results = await searchPoints(
    COL,
    vector,
    5,
    {
      must: [{ key: "preset_name", match: { value: presetName } }],
      must_not: [{ key: "_type", match: { value: "preset_meta" } }]
    },
    0.2 // Lower threshold for routing to be more inclusive
  );

  if (results.length === 0) {
    return {
      model: "openrouter/google/gemini-2.5-flash",
      category: "unknown",
      category_label: "Unknown",
      confidence: 0,
      preset_used: presetName,
      is_skill: false,
      alternatives: []
    };
  }

  const top = results[0].payload as unknown as RoutingRulePayload;
  return {
    model: top.model,
    category: top.category_slug,
    category_label: top.category_label,
    confidence: results[0].score,
    preset_used: presetName,
    is_skill: top.is_skill ?? false,
    alternatives: results.slice(1, 4).map(r => {
      const p = r.payload as unknown as RoutingRulePayload;
      return { model: p.model, category: p.category_slug, confidence: r.score };
    })
  };
}
