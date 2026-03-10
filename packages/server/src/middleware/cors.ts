import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'http://localhost:4000'],
  credentials: true,
})
