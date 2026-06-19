FROM node:24-alpine AS base
RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

################## DEV ################################################
FROM base AS dev
# No COPY, no RUN pnpm install — everything comes via volumes.
# The entrypoint just starts the dev server.
CMD ["sh", "-c", "pnpm --filter frontend dev"]

################## BUILD ##############################################
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY frontend/package.json ./frontend/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/game/package.json ./packages/game/

RUN pnpm install --frozen-lockfile

COPY frontend/ ./frontend/
COPY packages/ ./packages/

RUN pnpm --filter frontend build

################## PRODUCTION #########################################
FROM nginx:alpine AS runner
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]