FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/web/package.json packages/web/
RUN pnpm install --frozen-lockfile

# Build
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY packages/server/ packages/server/
COPY packages/web/ packages/web/
RUN pnpm build

# Copy web dist into server public dir for static serving
RUN cp -r packages/web/dist packages/server/public

# Create a standalone deploy bundle with real node_modules (no symlinks)
RUN pnpm --filter @cortex/server deploy /app/deploy

# Production
FROM node:22-slim
WORKDIR /app
COPY --from=base /app/deploy/dist ./dist
COPY --from=base /app/deploy/node_modules ./node_modules
COPY --from=base /app/packages/server/public ./public

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
