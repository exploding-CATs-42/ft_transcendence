import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
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
      game: resolve(__dirname, "src/game")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
