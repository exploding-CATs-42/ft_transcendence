import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      types: resolve(__dirname, "./src/types"),
      lib: resolve(__dirname, "./src/lib"),
      schemas: resolve(__dirname, "./src/schemas"),
      services: resolve(__dirname, "./src/services"),
      utils: resolve(__dirname, "./src/utils"),
      errors: resolve(__dirname, "./src/errors"),
      game: resolve(__dirname, "./src/game"),
      constants: resolve(__dirname, "./src/constants"),
      middlewares: resolve(__dirname, "./src/middlewares"),
      controllers: resolve(__dirname, "./src/controllers"),
      data: resolve(__dirname, "./src/data"),
      sockets: resolve(__dirname, "./src/sockets"),
      mappers: resolve(__dirname, "./src/mappers"),
      generated: resolve(__dirname, "./src/generated"),
    },
  },
});
