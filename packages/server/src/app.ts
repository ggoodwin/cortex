import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error.js";
import { authMiddleware } from "./middleware/auth.js";
import { healthRoutes } from "./routes/health.js";
import { memoryRoutes } from "./routes/memory.js";
import { routingRoutes } from "./routes/routing.js";
import { authRoutes } from "./routes/auth.js";

export function createApp(): Hono {
  const app = new Hono();

  // Global middleware
  app.use("*", corsMiddleware);
  app.use("*", errorHandler);

  // Public routes
  app.route("/api/health", healthRoutes);
  app.route("/api/auth", authRoutes);

  // Protected routes (auth middleware skips if AUTH_ENABLED=false)
  app.use("/api/memory/*", authMiddleware);
  app.use("/api/routing/*", authMiddleware);
  app.route("/api/memory", memoryRoutes);
  app.route("/api/routing", routingRoutes);

  return app;
}
