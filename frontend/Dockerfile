FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .


CMD ["sh", "-c", "pnpm install && pnpm dev --host 0.0.0.0 --port 5173"]