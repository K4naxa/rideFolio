import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import pluginOxlint from "eslint-plugin-oxlint";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },
  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },
  ...pluginOxlint.configs["flat/recommended"],
  {
    name: "app/custom-rules",
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    name: "app/typescript-parser-options",
    files: ["**/*.{ts,mts,tsx}"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.app.json", "./tsconfig.node.json", "./tsconfig.vitest.json"],
      },
    },
  },
);
