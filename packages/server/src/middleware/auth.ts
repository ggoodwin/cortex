import type { Context, Next } from "hono";
import { config } from "../config.js";
import * as jose from "jose";

export async function authMiddleware(c: Context, next: Next) {
  if (!config.auth.enabled) {
    return next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ ok: false, error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const secret = new TextEncoder().encode(config.auth.jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    c.set("user", payload);
    return next();
  } catch {
    return c.json({ ok: false, error: "Invalid or expired token" }, 401);
  }
}

export async function createToken(username: string): Promise<string> {
  const secret = new TextEncoder().encode(config.auth.jwtSecret);
  return new jose.SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}
