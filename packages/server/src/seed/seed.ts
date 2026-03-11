import 'dotenv/config'
import { ensureCollections } from '../services/qdrant.js'
import { seedPresets } from '../services/routing.js'

async function main() {
  console.log('Seeding Cortex...')
  await ensureCollections()
  await seedPresets()
  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
