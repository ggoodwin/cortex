import type { Context, Next } from 'hono'

export async function errorHandler(c: Context, next: Next) {
  try {
    await next()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    const status = (err as { status?: number }).status ?? 500
    console.error(`[${c.req.method}] ${c.req.path} - ${status}: ${message}`)
    return c.json({ ok: false, error: message }, status as 500)
  }
}
