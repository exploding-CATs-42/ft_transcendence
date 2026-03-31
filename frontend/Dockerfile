FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY package.json ./
RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev"]