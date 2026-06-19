FROM node:24-alpine

RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY packages/contracts/package.json ./packages/contracts/

CMD ["sh", "-c", "pnpm install --frozen-lockfile"]
