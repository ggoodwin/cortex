import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import { COLLECTIONS } from '@cortex/shared'
import type { UserPayload } from '@cortex/shared'
import { upsertPoint, scrollPoints, countPoints } from './qdrant.js'
import { config } from '../config.js'

const COL = COLLECTIONS.AUTH

export async function getUserCount(): Promise<number> {
  return countPoints(COL, { must: [{ key: '_type', match: { value: 'user' } }] })
}

export async function findUser(username: string): Promise<{ id: string; payload: UserPayload } | null> {
  const result = await scrollPoints(COL, {
    must: [
      { key: '_type', match: { value: 'user' } },
      { key: 'username', match: { value: username } },
    ],
  }, 1)

  if (result.points.length === 0) return null
  return {
    id: String(result.points[0].id),
    payload: result.points[0].payload as unknown as UserPayload,
  }
}

export async function createUser(username: string, password: string): Promise<string> {
  const existing = await findUser(username)
  if (existing) throw new Error('User already exists')

  const id = uuid()
  const now = new Date().toISOString()
  const zeroVector = new Array(config.embedding.dimensions).fill(0)

  const payload: UserPayload = {
    _type: 'user',
    username,
    password_hash: await bcrypt.hash(password, 12),
    created_at: now,
    updated_at: now,
  }

  await upsertPoint(COL, id, zeroVector, payload as unknown as Record<string, unknown>)
  return id
}

export async function verifyPassword(username: string, password: string): Promise<boolean> {
  const user = await findUser(username)
  if (!user) return false
  return bcrypt.compare(password, user.payload.password_hash)
}
