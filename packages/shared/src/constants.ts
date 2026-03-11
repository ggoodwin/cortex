export const COLLECTIONS = {
  MEMORIES: 'cortex_memories',
  ROUTING: 'cortex_routing',
  AUTH: 'cortex_auth',
} as const

export const SYSTEM_POINT_ID = '00000000-0000-0000-0000-000000000000'

export const PRESET_NAMES = {
  CHEAP: 'cheap',
  IDEAL: 'ideal',
  WORKHORSE: 'workhorse',
} as const

export const DEFAULT_EMBEDDING_DIMENSIONS = 1536
export const DEFAULT_SCORE_THRESHOLD = 0.3
export const DEFAULT_SEARCH_LIMIT = 5
export const MAX_SEARCH_LIMIT = 50
export const DEFAULT_IMPORTANCE = 5
