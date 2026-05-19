FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

################## DEV ################################################
FROM base AS dev
# Code + node_modules come via volumes.
# On first run: installs deps, generates prisma client, then starts dev server.
# On subsequent runs: pnpm install is near-instant, prisma generate is fast.
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm --filter backend prisma:generate && pnpm --filter backend prisma migrate deploy && pnpm --filter backend dev"]

################## BUILD ##############################################
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile

COPY backend/ ./backend/
RUN pnpm --filter backend prisma:generate && pnpm --filter backend build

################## PRODUCTION #########################################
FROM node:24-alpine AS runner
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile --filter backend

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma

WORKDIR /app/backend
CMD ["sh", "-c", "pnpm prisma:deploy && node dist/main.js"]