import OpenAI from 'openai'
import { config } from '../config.js'

let client: OpenAI | null = null
let lastApiKey = ''

function getClient(): OpenAI {
  const { apiKey, baseUrl } = config.embedding
  if (!client || apiKey !== lastApiKey) {
    if (!apiKey) {
      throw new Error('No embedding API key configured. Set EMBEDDING_API_KEY in .env')
    }
    client = new OpenAI({ apiKey, baseURL: baseUrl })
    lastApiKey = apiKey
  }
  return client
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getClient()
  const { model, dimensions } = config.embedding

  const response = await openai.embeddings.create({
    model,
    input: text,
    dimensions,
  })

  return response.data[0].embedding
}
