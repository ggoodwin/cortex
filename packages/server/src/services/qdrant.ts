import { QdrantClient } from '@qdrant/js-client-rest'
import { config } from '../config.js'
import { COLLECTIONS } from '@cortex/shared'

let client: QdrantClient | null = null
let currentUrl = ''
let currentApiKey = ''

export function getQdrantClient(): QdrantClient {
  const { url, apiKey } = config.qdrant
  if (!client || url !== currentUrl || apiKey !== currentApiKey) {
    client = new QdrantClient({ url, apiKey })
    currentUrl = url
    currentApiKey = apiKey
  }
  return client
}

function excludeSystemAndTrashed(filter?: Record<string, unknown>): Record<string, unknown> {
  const systemExclusion = { key: '_type', match: { value: 'preset_meta' } }
  const notTrashed = { is_empty: { key: 'trashed_at' } }
  if (!filter) {
    return { must_not: [systemExclusion], must: [notTrashed] }
  }
  const mustNot = (filter.must_not as unknown[] || []).slice()
  mustNot.push(systemExclusion)
  const must = (filter.must as unknown[] || []).slice()
  must.push(notTrashed)
  return { ...filter, must_not: mustNot, must }
}

export function excludeTrashed(filter?: Record<string, unknown>): Record<string, unknown> {
  const notTrashed = { is_empty: { key: 'trashed_at' } }
  if (!filter) return { must: [notTrashed] }
  const must = (filter.must as unknown[] || []).slice()
  must.push(notTrashed)
  return { ...filter, must }
}

async function ensureCollectionExists(
  name: string,
  vectorSize: number,
  indexes?: { keyword?: string[]; integer?: string[]; text?: string[] }
): Promise<void> {
  const qdrant = getQdrantClient()
  try {
    const exists = await qdrant.collectionExists(name)
    if (exists.exists) return
  } catch {
    // collection doesn't exist
  }

  await qdrant.createCollection(name, {
    vectors: { size: vectorSize, distance: 'Cosine' },
    optimizers_config: { indexing_threshold: 100 },
  })

  if (indexes) {
    for (const field of indexes.keyword ?? []) {
      await qdrant.createPayloadIndex(name, { field_name: field, field_schema: 'keyword' })
    }
    for (const field of indexes.integer ?? []) {
      await qdrant.createPayloadIndex(name, { field_name: field, field_schema: 'integer' })
    }
    for (const field of indexes.text ?? []) {
      await qdrant.createPayloadIndex(name, { field_name: field, field_schema: 'text' })
    }
  }
}

export async function ensureCollections(): Promise<void> {
  const dim = config.embedding.dimensions

  await ensureCollectionExists(COLLECTIONS.MEMORIES, dim, {
    keyword: ['category', 'project', 'tags', 'subcategory', 'source', 'agent_id', 'created_at', '_type', 'trashed_at'],
    integer: ['importance', 'access_count'],
    text: ['content'],
  })

  await ensureCollectionExists(COLLECTIONS.ROUTING, dim, {
    keyword: ['preset_name', 'category_slug', '_type'],
  })

  await ensureCollectionExists(COLLECTIONS.AUTH, dim, {
    keyword: ['username', '_type'],
  })
}

// -- Memory operations --

export async function upsertPoint(
  collection: string,
  id: string,
  vector: number[],
  payload: Record<string, unknown>
): Promise<void> {
  const qdrant = getQdrantClient()
  await qdrant.upsert(collection, {
    points: [{ id, vector, payload }],
  })
}

export async function getPoint(collection: string, id: string) {
  const qdrant = getQdrantClient()
  const results = await qdrant.retrieve(collection, {
    ids: [id],
    with_payload: true,
    with_vector: false,
  })
  return results[0] ?? null
}

export async function searchPoints(
  collection: string,
  vector: number[],
  limit: number,
  filter?: Record<string, unknown>,
  scoreThreshold?: number
) {
  const qdrant = getQdrantClient()
  return qdrant.search(collection, {
    vector,
    limit,
    with_payload: true,
    score_threshold: scoreThreshold ?? 0.3,
    filter: (filter ? filter : undefined) as never,
  })
}

export async function searchMemories(
  vector: number[],
  limit: number,
  filter?: Record<string, unknown>,
  scoreThreshold?: number
) {
  return searchPoints(
    COLLECTIONS.MEMORIES,
    vector,
    limit,
    excludeSystemAndTrashed(filter),
    scoreThreshold
  )
}

export async function updatePayload(
  collection: string,
  id: string,
  payload: Record<string, unknown>
): Promise<void> {
  const qdrant = getQdrantClient()
  await qdrant.setPayload(collection, {
    points: [id],
    payload,
  })
}

export async function deletePoint(collection: string, id: string): Promise<void> {
  const qdrant = getQdrantClient()
  await qdrant.delete(collection, { points: [id] })
}

export async function scrollPoints(
  collection: string,
  filter?: Record<string, unknown>,
  limit = 20,
  offset?: string
) {
  const qdrant = getQdrantClient()
  return qdrant.scroll(collection, {
    filter: (filter ?? undefined) as never,
    limit,
    with_payload: true,
    offset: offset ?? undefined,
  })
}

export async function countPoints(collection: string, filter?: Record<string, unknown>): Promise<number> {
  const qdrant = getQdrantClient()
  const result = await qdrant.count(collection, {
    filter: (filter ?? undefined) as never,
    exact: true,
  })
  return result.count
}

export async function checkConnection(): Promise<boolean> {
  try {
    const qdrant = getQdrantClient()
    await qdrant.getCollections()
    return true
  } catch {
    return false
  }
}
