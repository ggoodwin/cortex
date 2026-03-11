import { Hono } from "hono";
import {
  listPresets,
  getPreset,
  createOrReplacePreset,
  updateRule,
  resolveRoute,
  getActivePresetName,
  setActivePreset
} from "../services/routing.js";

export const routingRoutes = new Hono();

routingRoutes.get("/presets", async c => {
  const presets = await listPresets();
  return c.json({ ok: true, data: presets });
});

routingRoutes.get("/presets/:name", async c => {
  const preset = await getPreset(c.req.param("name"));
  if (!preset) return c.json({ ok: false, error: "Preset not found" }, 404);
  return c.json({ ok: true, data: preset });
});

routingRoutes.put("/presets/:name", async c => {
  const body = await c.req.json();
  if (!body.label || !body.rules) {
    return c.json({ ok: false, error: "label and rules are required" }, 400);
  }
  const preset = await createOrReplacePreset(c.req.param("name"), body);
  return c.json({ ok: true, data: preset });
});

routingRoutes.patch("/presets/:name/rules/:slug", async c => {
  const body = await c.req.json();
  const ok = await updateRule(c.req.param("name"), c.req.param("slug"), body);
  if (!ok) return c.json({ ok: false, error: "Rule not found" }, 404);
  return c.json({ ok: true });
});

routingRoutes.post("/resolve", async c => {
  const body = await c.req.json();
  if (!body.task_description) {
    return c.json({ ok: false, error: "task_description is required" }, 400);
  }
  const result = await resolveRoute(body);
  return c.json({ ok: true, data: result });
});

routingRoutes.get("/active", async c => {
  const name = await getActivePresetName();
  return c.json({ ok: true, data: { name } });
});

routingRoutes.put("/active", async c => {
  const body = await c.req.json();
  if (!body.name) return c.json({ ok: false, error: "name is required" }, 400);
  const ok = await setActivePreset(body.name);
  if (!ok) return c.json({ ok: false, error: "Preset not found" }, 404);
  return c.json({ ok: true });
});
