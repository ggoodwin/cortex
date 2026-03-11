import { useEffect, useState } from "react";
import { api } from "../api/client";

interface Rule {
  category_slug: string;
  category_label: string;
  category_description: string;
  model: string;
  is_skill: boolean;
  priority: number;
}

interface Preset {
  name: string;
  label: string;
  description: string;
  is_active: boolean;
  is_builtin: boolean;
  rules: Rule[];
}

export function RoutingConfig() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [editingRule, setEditingRule] = useState<{ slug: string; model: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api.get<{ ok: boolean; data: Preset[] }>("/routing/presets");
    setPresets(res.data);
    if (!selected && res.data.length > 0) {
      const active = res.data.find(p => p.is_active);
      setSelected(active?.name ?? res.data[0].name);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const activePreset = presets.find(p => p.name === selected);

  const activate = async (name: string) => {
    await api.put("/routing/active", { name });
    await load();
  };

  const saveRule = async () => {
    if (!editingRule || !selected) return;
    await api.patch(`/routing/presets/${selected}/rules/${editingRule.slug}`, { model: editingRule.model });
    setEditingRule(null);
    await load();
  };

  if (loading) return <p className="text-zinc-500">Loading...</p>;

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Routing Configuration</h2>

      <div className="flex gap-2 mb-6">
        {presets.map(p => (
          <button
            key={p.name}
            onClick={() => setSelected(p.name)}
            className={`px-3 py-1.5 rounded text-sm ${
              selected === p.name
                ? "bg-zinc-700 text-white"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}>
            {p.label}
            {p.is_active && <span className="ml-1 text-green-400 text-xs">(active)</span>}
          </button>
        ))}
      </div>

      {activePreset && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-zinc-400">{activePreset.description}</p>
              {activePreset.is_builtin && <span className="text-xs text-zinc-600">Built-in preset</span>}
            </div>
            {!activePreset.is_active && (
              <button
                onClick={() => activate(activePreset.name)}
                className="px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded text-sm">
                Set Active
              </button>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left px-4 py-2 font-medium">Category</th>
                  <th className="text-left px-4 py-2 font-medium">Model</th>
                  <th className="text-left px-4 py-2 font-medium w-20">Type</th>
                  <th className="text-left px-4 py-2 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {activePreset.rules
                  .sort((a, b) => a.priority - b.priority)
                  .map(rule => (
                    <tr key={rule.category_slug} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-4 py-2 text-zinc-300">{rule.category_label}</td>
                      <td className="px-4 py-2">
                        {editingRule?.slug === rule.category_slug ? (
                          <div className="flex gap-2">
                            <input
                              value={editingRule.model}
                              onChange={e => setEditingRule({ ...editingRule, model: e.target.value })}
                              className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs focus:outline-none"
                              onKeyDown={e => e.key === "Enter" && saveRule()}
                            />
                            <button onClick={saveRule} className="text-xs text-green-400 hover:text-green-300">
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRule(null)}
                              className="text-xs text-zinc-500 hover:text-zinc-300">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-mono text-xs">{rule.model}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {rule.is_skill ? (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300">skill</span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">model</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {!editingRule && (
                          <button
                            onClick={() => setEditingRule({ slug: rule.category_slug, model: rule.model })}
                            className="text-xs text-zinc-500 hover:text-zinc-300">
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
