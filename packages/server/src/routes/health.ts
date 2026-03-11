import { Hono } from "hono";
import { checkConnection } from "../services/qdrant.js";
import type { HealthResponse } from "@cortex/shared";

const startTime = Date.now();

export const healthRoutes = new Hono();

healthRoutes.get("/", async c => {
  const qdrantOk = await checkConnection();
  const response: HealthResponse = {
    status: qdrantOk ? "ok" : "degraded",
    qdrant: qdrantOk ? "connected" : "disconnected",
    version: "0.1.0",
    uptime: Math.floor((Date.now() - startTime) / 1000)
  };
  return c.json({ ok: qdrantOk, data: response }, qdrantOk ? 200 : 503);
});
