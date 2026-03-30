import adapter from "@sveltejs/adapter-node";
import { vitePreprocess as vite } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vite(),
  kit: {
    adapter: adapter(),
    files: {
      src: "src/web",
      routes: "src/web/routes"
    },
    alias: {
      "@": "src/web/"
    }
  }
};

export default config;
