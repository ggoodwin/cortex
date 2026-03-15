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

# Remove dev dependencies
RUN pnpm prune --prod

ENV NODE_ENV=production
EXPOSE 4000
WORKDIR /app/packages/server
CMD ["node", "dist/index.js"]
