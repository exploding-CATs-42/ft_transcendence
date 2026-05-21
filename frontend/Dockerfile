FROM node:24-alpine AS base
RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

################## DEV ################################################
FROM base AS dev
# No COPY, no RUN pnpm install — everything comes via volumes.
# The entrypoint installs deps at runtime if node_modules is empty,
# then starts the dev server.
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm --filter frontend dev"]

################## BUILD ##############################################
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

COPY frontend/ ./frontend/
RUN pnpm --filter frontend build

################## PRODUCTION #########################################
FROM nginx:alpine AS runner
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]