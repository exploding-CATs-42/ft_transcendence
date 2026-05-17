FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

################## DEV ################################################
FROM base AS dev
WORKDIR /app
CMD ["pnpm", "--filter", "frontend", "dev"]

################## BUILD ##############################################
FROM base AS build
COPY frontend/ ./frontend/
RUN pnpm --filter frontend build

################## PRODUCTION #########################################
FROM nginx:alpine AS runner
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]