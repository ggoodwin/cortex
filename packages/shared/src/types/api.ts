export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  ok: boolean
  data: T[]
  next_offset?: string
  total?: number
}

export interface HealthResponse {
  status: 'ok' | 'degraded'
  qdrant: 'connected' | 'disconnected'
  version: string
  uptime: number
}
