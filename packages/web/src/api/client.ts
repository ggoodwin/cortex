const BASE = '/api'

let authToken: string | null = localStorage.getItem('cortex_token')

export function setToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem('cortex_token', token)
  } else {
    localStorage.removeItem('cortex_token')
  }
}

export function getToken(): string | null {
  return authToken
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error ?? `Request failed: ${res.status}`)
  }

  return json
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
