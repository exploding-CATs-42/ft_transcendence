import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      types: resolve(__dirname, "src/web/@types"),
      components: resolve(__dirname, "src/web/components"),
      pages: resolve(__dirname, "src/web/pages"),
      assets: resolve(__dirname, "src/web/assets"),
      hooks: resolve(__dirname, "src/web/hooks"),
      game: resolve(__dirname, "src/game"),
      utils: resolve(__dirname, "src/web/utils"),
      api: resolve(__dirname, "src/web/api"),
      schemas: resolve(__dirname, "src/web/schemas"),
      constants: resolve(__dirname, "src/web/constants"),
      context: resolve(__dirname, "src/web/context"),
      routes: resolve(__dirname, "src/web/routes"),
      socket: resolve(__dirname, "src/web/socket"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
