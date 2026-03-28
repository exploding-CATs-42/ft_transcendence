import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(({ mode }) => ({
  plugins: [svelte(), sveltekit()],
  build: {
    sourcemap: mode === "development"
  }
}));
