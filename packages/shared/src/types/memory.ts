export interface MemoryPayload {
  content: string
  category: string
  subcategory?: string
  project: string
  tags: string[]
  importance: number
  source: 'user' | 'agent' | 'api'
  agent_id?: string
  created_at: string
  updated_at: string
  accessed_at: string
  access_count: number
  related_files?: string[]
  related_memory_ids?: string[]
  trashed_at?: string | null
  _type?: string
}

export interface MemoryCreateInput {
  content: string
  category: string
  subcategory?: string
  project?: string
  tags?: string[]
  importance?: number
  source?: MemoryPayload['source']
  agent_id?: string
  related_files?: string[]
}

export interface MemorySearchInput {
  query: string
  category?: string
  project?: string
  tags?: string[]
  limit?: number
  min_importance?: number
  min_score?: number
}

export interface MemorySearchResult {
  id: string
  score: number
  payload: MemoryPayload
}

export interface MemoryStats {
  total: number
  by_category: Record<string, number>
  by_project: Record<string, number>
  oldest?: string
  newest?: string
}
