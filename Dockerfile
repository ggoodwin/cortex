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

# Production
FROM node:22-slim
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=base /app/packages/server/dist ./dist
COPY --from=base /app/packages/server/public ./public
COPY --from=base /app/packages/server/package.json ./
COPY --from=base /app/packages/shared/dist ./node_modules/@cortex/shared/dist
COPY --from=base /app/packages/shared/package.json ./node_modules/@cortex/shared/
COPY --from=base /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
