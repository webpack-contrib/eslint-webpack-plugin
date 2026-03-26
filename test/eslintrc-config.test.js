import { join } from "node:path";

import { ESLint } from "eslint";
import pack from "./utils/pack";

(ESLint && Number.parseFloat(ESLint.version) >= 10 ? describe.skip : describe)(
  "succeed on eslintrc-configuration",
  () => {
    // eslint-disable-next-line jest/require-top-level-describe, jest/consistent-test-it
    it("should work with eslintrc configuration type", async () => {
      const overrideConfigFile = join(
        __dirname,
        "fixtures",
        "eslintrc-config.js",
      );
      const compiler = pack("full-of-problems", {
        configType: "eslintrc",
        overrideConfigFile,
      });

      const stats = await compiler.runAsync();
      const { errors } = stats.compilation;

      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("full-of-problems.js");
      expect(stats.hasWarnings()).toBe(true);
    });
  },
);
