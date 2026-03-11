import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

interface Memory {
  id: string;
  content: string;
  category: string;
  subcategory?: string;
  project: string;
  tags: string[];
  importance: number;
  source: string;
  created_at: string;
  updated_at: string;
  access_count: number;
}

export function MemoryEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [project, setProject] = useState("");
  const [tags, setTags] = useState("");
  const [importance, setImportance] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get<{ ok: boolean; data: Memory }>(`/memory/${id}`)
      .then(r => {
        const m = r.data;
        setMemory(m);
        setContent(m.content);
        setCategory(m.category);
        setProject(m.project);
        setTags(m.tags.join(", "));
        setImportance(m.importance);
      })
      .catch(e => setError(e.message));
  }, [id]);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    setError("");
    try {
      await api.patch(`/memory/${id}`, {
        content,
        category,
        project,
        tags: tags
          .split(",")
          .map(t => t.trim())
          .filter(Boolean),
        importance
      });
      navigate("/memory");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const trash = async () => {
    if (!id) return;
    await api.delete(`/memory/${id}`);
    navigate("/memory");
  };

  if (error && !memory) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!memory) {
    return <p className="text-zinc-500">Loading...</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Edit Memory</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate("/memory")} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200">
            Cancel
          </button>
          <button onClick={trash} className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300">
            Trash
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Category</label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Project</label>
            <input
              value={project}
              onChange={e => setProject(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Importance ({importance})</label>
          <input
            type="range"
            min={1}
            max={10}
            value={importance}
            onChange={e => setImportance(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="text-xs text-zinc-500 flex gap-4 pt-2">
          <span>Source: {memory.source}</span>
          <span>Created: {new Date(memory.created_at).toLocaleDateString()}</span>
          <span>Accessed: {memory.access_count}x</span>
        </div>
      </div>
    </div>
  );
}
