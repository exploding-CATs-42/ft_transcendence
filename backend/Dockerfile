FROM node:24-alpine AS base
RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

################## DEV ################################################
FROM base AS dev
# No COPY, no RUN pnpm install — everything comes via volumes.
# The entrypoint just starts the dev server.
CMD ["sh", "-c", "pnpm --filter backend dev"]

