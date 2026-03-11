import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../../../.env')
dotenv.config({ path: envPath })

function env(key: string, fallback?: string): string {
  const val = process.env[key]
  if (val !== undefined) return val
  if (fallback !== undefined) return fallback
  throw new Error(`Missing required env var: ${key}`)
}

function envInt(key: string, fallback: number): number {
  const val = process.env[key]
  return val ? parseInt(val, 10) : fallback
}

function envBool(key: string, fallback: boolean): boolean {
  const val = process.env[key]
  if (val === undefined) return fallback
  return val === 'true' || val === '1'
}

export const config = {
  server: {
    port: envInt('PORT', 4000),
    nodeEnv: env('NODE_ENV', 'development'),
    isDev: env('NODE_ENV', 'development') === 'development',
  },
  auth: {
    enabled: envBool('AUTH_ENABLED', false),
    jwtSecret: env('JWT_SECRET', 'cortex-dev-secret'),
  },
  qdrant: {
    url: env('QDRANT_URL', 'http://localhost:6333'),
    apiKey: env('QDRANT_API_KEY', 'cortex-local-key'),
  },
  embedding: {
    apiKey: env('EMBEDDING_API_KEY', ''),
    baseUrl: env('EMBEDDING_BASE_URL', 'https://api.openai.com/v1'),
    model: env('EMBEDDING_MODEL', 'text-embedding-3-small'),
    dimensions: envInt('EMBEDDING_DIMENSIONS', 1536),
  },
} as const
