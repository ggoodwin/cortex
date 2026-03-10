import { useState } from 'react'

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>
  onSetup: (username: string, password: string) => Promise<void>
}

export function Login({ onLogin, onSetup }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSetup, setIsSetup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSetup) {
        await onSetup(username, password)
      } else {
        await onLogin(username, password)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Auth failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Cortex</h1>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50"
          >
            {loading ? '...' : isSetup ? 'Create Account' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => setIsSetup(!isSetup)}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            {isSetup ? 'Already have an account? Login' : 'First time? Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
