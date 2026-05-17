FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile

################## DEV ################################################
FROM base AS dev
WORKDIR /app
CMD ["sh", "-c", "pnpm --filter backend prisma:generate && pnpm --filter backend dev"]

################## BUILD ##############################################
FROM base AS build
COPY backend/ ./backend/
RUN pnpm --filter backend build

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