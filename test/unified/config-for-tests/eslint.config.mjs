import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig({
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
  rules: {
    "no-unused-vars": "error",
    "no-var": "warn",
  },
});
