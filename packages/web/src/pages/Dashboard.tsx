import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface Stats {
  total: number
  by_category: Record<string, number>
  by_project: Record<string, number>
  by_source: Record<string, number>
}

interface Health {
  status: string
  qdrant: string
  uptime: number
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [activePreset, setActivePreset] = useState<string>('')

  useEffect(() => {
    api.get<{ ok: boolean; data: Stats }>('/memory/stats').then((r) => setStats(r.data)).catch(() => {})
    api.get<{ ok: boolean; data: Health }>('/health').then((r) => setHealth(r.data)).catch(() => {})
    api.get<{ ok: boolean; data: { name: string } }>('/routing/active').then((r) => setActivePreset(r.data.name)).catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-400">Qdrant</div>
          <div className={`text-lg font-semibold ${health?.qdrant === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
            {health?.qdrant ?? '...'}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-400">Total Memories</div>
          <div className="text-lg font-semibold">{stats?.total ?? '...'}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-400">Active Preset</div>
          <div className="text-lg font-semibold capitalize">{activePreset || '...'}</div>
        </div>
      </div>

      {stats && Object.keys(stats.by_category).length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Memories by Category</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.by_category).sort(([,a], [,b]) => b - a).map(([cat, count]) => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-zinc-300">{cat}</span>
                <span className="text-zinc-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && Object.keys(stats.by_project).length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Memories by Project</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.by_project).sort(([,a], [,b]) => b - a).map(([proj, count]) => (
              <div key={proj} className="flex justify-between text-sm">
                <span className="text-zinc-300">{proj}</span>
                <span className="text-zinc-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
