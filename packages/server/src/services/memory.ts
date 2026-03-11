import type {
  MemoryCreateInput,
  MemoryPayload,
  MemorySearchInput,
  MemorySearchResult,
  MemoryStats
} from "@cortex/shared";
import {
  COLLECTIONS,
  DEFAULT_IMPORTANCE,
  DEFAULT_SCORE_THRESHOLD,
  DEFAULT_SEARCH_LIMIT,
  MAX_SEARCH_LIMIT
} from "@cortex/shared";
import { v4 as uuid } from "uuid";
import { generateEmbedding } from "./embeddings.js";
import {
  countPoints,
  excludeTrashed,
  getPoint,
  scrollPoints,
  searchMemories,
  updatePayload,
  upsertPoint
} from "./qdrant.js";

const COL = COLLECTIONS.MEMORIES;

export async function createMemory(input: MemoryCreateInput): Promise<{ id: string; payload: MemoryPayload }> {
  const id = uuid();
  const now = new Date().toISOString();
  const vector = await generateEmbedding(input.content);

  const payload: MemoryPayload = {
    content: input.content,
    category: input.category,
    subcategory: input.subcategory,
    project: input.project ?? "global",
    tags: input.tags ?? [],
    importance: input.importance ?? DEFAULT_IMPORTANCE,
    source: input.source ?? "api",
    agent_id: input.agent_id,
    created_at: now,
    updated_at: now,
    accessed_at: now,
    access_count: 0,
    related_files: input.related_files,
    trashed_at: null
  };

  await upsertPoint(COL, id, vector, payload as unknown as Record<string, unknown>);
  return { id, payload };
}

export async function getMemory(id: string): Promise<{ id: string; payload: MemoryPayload } | null> {
  const point = await getPoint(COL, id);
  if (!point) return null;

  // Bump access stats
  await updatePayload(COL, id, {
    accessed_at: new Date().toISOString(),
    access_count: ((point.payload as unknown as MemoryPayload).access_count ?? 0) + 1
  });

  return { id: String(point.id), payload: point.payload as unknown as MemoryPayload };
}

export async function updateMemory(
  id: string,
  updates: Partial<MemoryCreateInput>
): Promise<{ id: string; payload: MemoryPayload } | null> {
  const existing = await getPoint(COL, id);
  if (!existing) return null;

  const oldPayload = existing.payload as unknown as MemoryPayload;
  const now = new Date().toISOString();

  const merged: Partial<MemoryPayload> = { updated_at: now };
  if (updates.category !== undefined) merged.category = updates.category;
  if (updates.subcategory !== undefined) merged.subcategory = updates.subcategory;
  if (updates.project !== undefined) merged.project = updates.project;
  if (updates.tags !== undefined) merged.tags = updates.tags;
  if (updates.importance !== undefined) merged.importance = updates.importance;
  if (updates.source !== undefined) merged.source = updates.source;
  if (updates.agent_id !== undefined) merged.agent_id = updates.agent_id;
  if (updates.related_files !== undefined) merged.related_files = updates.related_files;

  if (updates.content !== undefined && updates.content !== oldPayload.content) {
    merged.content = updates.content;
    const vector = await generateEmbedding(updates.content);
    const fullPayload = { ...oldPayload, ...merged };
    await upsertPoint(COL, id, vector, fullPayload as unknown as Record<string, unknown>);
    return { id, payload: fullPayload as MemoryPayload };
  }

  await updatePayload(COL, id, merged as Record<string, unknown>);
  return { id, payload: { ...oldPayload, ...merged } as MemoryPayload };
}

export async function softDeleteMemory(id: string): Promise<boolean> {
  const point = await getPoint(COL, id);
  if (!point) return false;
  await updatePayload(COL, id, { trashed_at: new Date().toISOString() });
  return true;
}

export async function restoreMemory(id: string): Promise<boolean> {
  const point = await getPoint(COL, id);
  if (!point) return false;
  const qdrant = (await import("./qdrant.js")).getQdrantClient();
  await qdrant.setPayload(COL, { points: [id], payload: { trashed_at: null } });
  return true;
}

export async function searchMemoriesService(input: MemorySearchInput): Promise<MemorySearchResult[]> {
  const vector = await generateEmbedding(input.query);
  const limit = Math.min(input.limit ?? DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT);

  const filter: Record<string, unknown> = { must: [] as unknown[] };
  const must = filter.must as unknown[];

  if (input.category) must.push({ key: "category", match: { value: input.category } });
  if (input.project) must.push({ key: "project", match: { value: input.project } });
  if (input.tags?.length) {
    for (const tag of input.tags) {
      must.push({ key: "tags", match: { value: tag } });
    }
  }
  if (input.min_importance) {
    must.push({ key: "importance", range: { gte: input.min_importance } });
  }

  const results = await searchMemories(
    vector,
    limit,
    must.length > 0 ? filter : undefined,
    input.min_score ?? DEFAULT_SCORE_THRESHOLD
  );

  return results.map(r => ({
    id: String(r.id),
    score: r.score,
    payload: r.payload as unknown as MemoryPayload
  }));
}

export async function browseMemories(
  filters: { category?: string; project?: string; tags?: string[] },
  limit = 20,
  offset?: string
) {
  const filter: Record<string, unknown> = { must: [] as unknown[] };
  const must = filter.must as unknown[];

  if (filters.category) must.push({ key: "category", match: { value: filters.category } });
  if (filters.project) must.push({ key: "project", match: { value: filters.project } });
  if (filters.tags?.length) {
    for (const tag of filters.tags) {
      must.push({ key: "tags", match: { value: tag } });
    }
  }

  const combined = excludeTrashed(must.length > 0 ? filter : undefined);
  const result = await scrollPoints(COL, combined, limit, offset);
  return {
    memories: result.points.map(p => ({
      id: String(p.id),
      payload: p.payload as unknown as MemoryPayload
    })),
    next_offset: result.next_page_offset ? String(result.next_page_offset) : undefined
  };
}

export async function getMemoryStats(): Promise<MemoryStats> {
  const total = await countPoints(COL, excludeTrashed());

  // Scroll all to get category/project counts
  const all = await scrollPoints(COL, excludeTrashed(), 1000);
  const by_category: Record<string, number> = {};
  const by_project: Record<string, number> = {};
  let oldest: string | undefined;
  let newest: string | undefined;

  for (const point of all.points) {
    const p = point.payload as unknown as MemoryPayload;
    by_category[p.category] = (by_category[p.category] ?? 0) + 1;
    const proj = p.project || "global";
    by_project[proj] = (by_project[proj] ?? 0) + 1;
    if (!oldest || p.created_at < oldest) oldest = p.created_at;
    if (!newest || p.created_at > newest) newest = p.created_at;
  }

  return { total, by_category, by_project, oldest, newest };
}
