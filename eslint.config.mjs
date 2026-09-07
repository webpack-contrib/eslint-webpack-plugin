import { defineConfig } from "eslint/config";
import configs from "eslint-config-webpack/configs.js";

export default defineConfig([
  {
    ignores: [
      "test/stylelint/fixtures/**/*",
      "test/stylelint/outputs/**/*",
      "test/unified/fixtures/**/*",
      "test/unified/outputs/**/*",
    ],
  },
  {
    extends: [configs["recommended-dirty"]],
  },
]);
