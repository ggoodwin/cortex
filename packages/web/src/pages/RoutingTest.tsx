import { useState } from "react";
import { api } from "../api/client";

interface ResolveResult {
  model: string;
  category: string;
  category_label: string;
  confidence: number;
  preset_used: string;
  is_skill: boolean;
  alternatives: Array<{ model: string; category: string; confidence: number }>;
}

export function RoutingTest() {
  const [task, setTask] = useState("");
  const [preset, setPreset] = useState("");
  const [result, setResult] = useState<ResolveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body: Record<string, string> = { task_description: task };
      if (preset) body.preset = preset;

      const res = await api.post<{ ok: boolean; data: ResolveResult }>("/routing/resolve", body);
      setResult(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Resolve failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Route Test</h2>

      <form onSubmit={resolve} className="flex flex-col gap-3 mb-6">
        <textarea
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="Describe a task to route... e.g. 'fix a small CSS bug in the sidebar'"
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
        />
        <div className="flex gap-3">
          <input
            type="text"
            value={preset}
            onChange={e => setPreset(e.target.value)}
            placeholder="Preset (leave blank for active)"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50">
            {loading ? "Resolving..." : "Resolve Route"}
          </button>
        </div>
      </form>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {result && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Routed to</div>
              <div className="font-mono text-lg text-white">{result.model}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500 mb-1">Confidence</div>
              <div
                className={`text-lg font-bold ${result.confidence > 0.7 ? "text-green-400" : result.confidence > 0.4 ? "text-yellow-400" : "text-red-400"}`}>
                {(result.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <span className="text-zinc-500">Category:</span>
              <span className="ml-2 text-zinc-300">{result.category_label}</span>
            </div>
            <div>
              <span className="text-zinc-500">Preset:</span>
              <span className="ml-2 text-zinc-300">{result.preset_used}</span>
            </div>
            <div>
              <span className="text-zinc-500">Type:</span>
              <span className={`ml-2 ${result.is_skill ? "text-purple-300" : "text-zinc-300"}`}>
                {result.is_skill ? "Skill" : "Model"}
              </span>
            </div>
          </div>

          {result.alternatives.length > 0 && (
            <div>
              <div className="text-xs text-zinc-500 mb-2">Alternatives</div>
              <div className="flex flex-col gap-1">
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="flex justify-between text-xs text-zinc-400">
                    <span className="font-mono">{alt.model}</span>
                    <span>{(alt.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
