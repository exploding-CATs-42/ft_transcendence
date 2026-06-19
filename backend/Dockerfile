FROM node:24-alpine AS base
RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

################## DEV ################################################
FROM base AS dev
# No COPY, no RUN pnpm install — everything comes via volumes.
# The entrypoint just starts the dev server.
CMD ["sh", "-c", "pnpm --filter backend dev"]

################## BUILD ##############################################
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY backend/package.json ./backend/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/game/package.json ./packages/game/

RUN pnpm install --frozen-lockfile

COPY backend/ ./backend/
COPY packages/ ./packages/

RUN pnpm --filter backend prisma:generate && pnpm --filter backend prisma:deploy && pnpm --filter backend build

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