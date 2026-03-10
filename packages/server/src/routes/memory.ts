import { Hono } from 'hono'
import {
  createMemory,
  getMemory,
  updateMemory,
  softDeleteMemory,
  restoreMemory,
  searchMemoriesService,
  browseMemories,
  getMemoryStats,
} from '../services/memory.js'

export const memoryRoutes = new Hono()

memoryRoutes.post('/', async (c) => {
  const body = await c.req.json()
  if (!body.content || !body.category) {
    return c.json({ ok: false, error: 'content and category are required' }, 400)
  }
  const result = await createMemory(body)
  return c.json({ ok: true, data: result }, 201)
})

memoryRoutes.post('/search', async (c) => {
  const body = await c.req.json()
  if (!body.query) {
    return c.json({ ok: false, error: 'query is required' }, 400)
  }
  const results = await searchMemoriesService(body)
  return c.json({ ok: true, data: results })
})

memoryRoutes.get('/browse', async (c) => {
  const category = c.req.query('category')
  const project = c.req.query('project')
  const tags = c.req.query('tags')?.split(',').filter(Boolean)
  const limit = parseInt(c.req.query('limit') ?? '20', 10)
  const offset = c.req.query('offset')

  const result = await browseMemories({ category, project, tags }, limit, offset)
  return c.json({ ok: true, ...result })
})

memoryRoutes.get('/stats', async (c) => {
  const stats = await getMemoryStats()
  return c.json({ ok: true, data: stats })
})

memoryRoutes.get('/:id', async (c) => {
  const result = await getMemory(c.req.param('id'))
  if (!result) return c.json({ ok: false, error: 'Memory not found' }, 404)
  return c.json({ ok: true, data: result })
})

memoryRoutes.patch('/:id', async (c) => {
  const body = await c.req.json()
  const result = await updateMemory(c.req.param('id'), body)
  if (!result) return c.json({ ok: false, error: 'Memory not found' }, 404)
  return c.json({ ok: true, data: result })
})

memoryRoutes.delete('/:id', async (c) => {
  const ok = await softDeleteMemory(c.req.param('id'))
  if (!ok) return c.json({ ok: false, error: 'Memory not found' }, 404)
  return c.json({ ok: true })
})

memoryRoutes.post('/:id/restore', async (c) => {
  const ok = await restoreMemory(c.req.param('id'))
  if (!ok) return c.json({ ok: false, error: 'Memory not found' }, 404)
  return c.json({ ok: true })
})
