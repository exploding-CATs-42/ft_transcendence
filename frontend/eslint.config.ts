import { defineConfig } from "eslint/config";
import svelteConfig from "./svelte.config.js";
import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";

export default defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  {
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        svelteConfig
      }
    }
  },
  {
    files: ["**/*.ts", "**/*.svelte"],
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" }
      ],
      "svelte/no-navigation-without-resolve": "off"
    }
  }
]);
