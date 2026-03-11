import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { createApp } from './app.js'
import { config } from './config.js'
import { ensureCollections, checkConnection } from './services/qdrant.js'
import { seedPresets } from './services/routing.js'

async function main() {
  console.log('Cortex starting...')

  // Check Qdrant connection
  const connected = await checkConnection()
  if (!connected) {
    console.error('Failed to connect to Qdrant at', config.qdrant.url)
    console.error('Make sure Qdrant is running: docker compose up qdrant')
    process.exit(1)
  }
  console.log('Connected to Qdrant')

  // Initialize collections and indexes
  await ensureCollections()
  console.log('Collections ready')

  // Seed built-in routing presets
  await seedPresets()
  console.log('Presets seeded')

  const app = createApp()

  // Serve static frontend in production
  if (config.server.nodeEnv === 'production') {
    app.use('/*', serveStatic({ root: './public' }))
  }

  console.log(`Cortex server listening on port ${config.server.port}`)
  console.log(`  API:    http://localhost:${config.server.port}/api`)
  console.log(`  Health: http://localhost:${config.server.port}/api/health`)
  if (config.auth.enabled) {
    console.log('  Auth:   ENABLED')
  } else {
    console.log('  Auth:   disabled')
  }

  serve({
    fetch: app.fetch,
    port: config.server.port,
  })
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
