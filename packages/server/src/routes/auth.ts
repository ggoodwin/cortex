import { Hono } from "hono";
import { config } from "../config.js";
import { getUserCount, createUser, verifyPassword } from "../services/auth.js";
import { createToken } from "../middleware/auth.js";

export const authRoutes = new Hono();

authRoutes.post("/setup", async c => {
  if (!config.auth.enabled) {
    return c.json({ ok: false, error: "Auth is disabled" }, 400);
  }

  const count = await getUserCount();
  if (count > 0) {
    return c.json({ ok: false, error: "Setup already completed. Use /login instead." }, 400);
  }

  const body = await c.req.json();
  if (!body.username || !body.password) {
    return c.json({ ok: false, error: "username and password are required" }, 400);
  }

  await createUser(body.username, body.password);
  const token = await createToken(body.username);
  return c.json({ ok: true, data: { token, username: body.username } }, 201);
});

authRoutes.post("/login", async c => {
  if (!config.auth.enabled) {
    return c.json({ ok: false, error: "Auth is disabled" }, 400);
  }

  const body = await c.req.json();
  if (!body.username || !body.password) {
    return c.json({ ok: false, error: "username and password are required" }, 400);
  }

  const valid = await verifyPassword(body.username, body.password);
  if (!valid) {
    return c.json({ ok: false, error: "Invalid credentials" }, 401);
  }

  const token = await createToken(body.username);
  return c.json({ ok: true, data: { token, username: body.username } });
});

authRoutes.get("/me", async c => {
  if (!config.auth.enabled) {
    return c.json({ ok: true, data: { username: "anonymous", auth_enabled: false } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (c as any).get("user") as { sub?: string } | undefined;
  return c.json({ ok: true, data: { username: user?.sub ?? "unknown", auth_enabled: true } });
});
