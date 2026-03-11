import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";

interface MemoryItem {
  id: string;
  content: string;
  category: string;
  project: string;
  tags: string[];
  importance: number;
  score?: number;
  created_at: string;
}

interface BrowseResponse {
  ok: boolean;
  memories: { id: string; payload: Omit<MemoryItem, "id" | "score"> }[];
  next_offset?: string;
}

export function MemorySearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [project, setProject] = useState("");
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nextOffset, setNextOffset] = useState<string | undefined>();

  const browse = useCallback(
    async (offset?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "20" });
        if (category) params.set("category", category);
        if (project) params.set("project", project);
        if (offset) params.set("offset", offset);

        const res = await api.get<BrowseResponse>(`/memory/browse?${params}`);
        const items = res.memories.map(m => ({ id: m.id, ...m.payload }));
        const sorted = items.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
        if (offset) {
          setMemories(prev => [...prev, ...sorted]);
        } else {
          setMemories(sorted);
        }
        setNextOffset(res.next_offset);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [category, project]
  );

  useEffect(() => {
    browse();
  }, [browse]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearched(false);
      browse();
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const body: Record<string, unknown> = { query, limit: 20 };
      if (category) body.category = category;
      if (project) body.project = project;

      const res = await api.post<{
        ok: boolean;
        data: { id: string; score: number; payload: Omit<MemoryItem, "id" | "score"> }[];
      }>("/memory/search", body);
      setMemories(res.data.map(r => ({ id: r.id, score: r.score, ...r.payload })));
      setNextOffset(undefined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Memories</h2>

      <form onSubmit={search} className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search memories semantically..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
        />
        <div className="flex gap-3">
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Category filter"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
          <input
            type="text"
            value={project}
            onChange={e => setProject(e.target.value)}
            placeholder="Project filter"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {memories.map(m => (
          <Link
            key={m.id}
            to={`/memory/${m.id}`}
            className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex gap-2 items-center">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{m.category}</span>
                <span className="text-xs text-zinc-500">{m.project}</span>
              </div>
              <div className="flex gap-2 items-center">
                {m.score != null && <span className="text-xs text-zinc-500">score: {m.score.toFixed(3)}</span>}
                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-yellow-400">
                  {"*".repeat(Math.min(m.importance ?? 0, 5))}
                </span>
                <span className="text-xs text-zinc-600">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="text-sm text-zinc-300 line-clamp-3">{m.content}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {(m.tags ?? []).map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  #{t}
                </span>
              ))}
            </div>
          </Link>
        ))}

        {memories.length === 0 && !loading && (
          <p className="text-sm text-zinc-500 text-center py-8">{searched ? "No results found" : "No memories yet"}</p>
        )}

        {nextOffset && !searched && (
          <button
            onClick={() => browse(nextOffset)}
            disabled={loading}
            className="mx-auto px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-50">
            {loading ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
