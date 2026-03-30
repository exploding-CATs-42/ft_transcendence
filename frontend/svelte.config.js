import adapterStatic from "@sveltejs/adapter-static";
import { vite } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vite(),
  kit: {
    adapter: adapterStatic(),
    files: {
      src: "src/web",
      routes: "src/web/routes"
    }
  }
};

export default config;
