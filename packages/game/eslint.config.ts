import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, ts.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.tools.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
    ignores: ["**/**.visualized.ts"],
  },
]);
