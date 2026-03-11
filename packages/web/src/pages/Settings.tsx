import { useEffect, useState } from "react";
import { api } from "../api/client";

interface Health {
  status: string;
  qdrant: string;
  uptime: number;
  collections: Record<string, { points: number }>;
}

export function Settings() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    api
      .get<{ ok: boolean; data: Health }>("/health")
      .then(r => setHealth(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">System Health</h3>
        {health ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-zinc-500">Status:</span>
              <span className={`ml-2 ${health.status === "ok" ? "text-green-400" : "text-red-400"}`}>
                {health.status}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Qdrant:</span>
              <span className={`ml-2 ${health.qdrant === "connected" ? "text-green-400" : "text-red-400"}`}>
                {health.qdrant}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Uptime:</span>
              <span className="ml-2 text-zinc-300">{Math.round(health.uptime)}s</span>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">Loading...</p>
        )}
      </div>

      {health?.collections && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Collections</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(health.collections).map(([name, info]) => (
              <div key={name} className="flex justify-between text-sm">
                <span className="text-zinc-300 font-mono text-xs">{name}</span>
                <span className="text-zinc-500">{info.points} points</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">API Info</h3>
        <div className="text-sm text-zinc-400">
          <p className="mb-1">
            Base URL: <span className="font-mono text-zinc-300">http://localhost:4000/api</span>
          </p>
          <p>Docs: See README.md for full API reference</p>
        </div>
      </div>
    </div>
  );
}
