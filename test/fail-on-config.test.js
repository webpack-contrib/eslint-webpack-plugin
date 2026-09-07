import { join } from "node:path";

import { ESLint } from "eslint";
import pack from "./utils/pack";

(ESLint && Number.parseFloat(ESLint.version) >= 10 ? describe.skip : describe)(
  "fail on config",
  () => {
    // eslint-disable-next-line jest/require-top-level-describe, jest/consistent-test-it
    it("fails when .eslintrc is not a proper format", async () => {
      const overrideConfigFile = join(import.meta.dirname, ".badeslintrc");
      const compiler = pack("error", {
        configType: "eslintrc",
        overrideConfigFile,
      });

      const stats = await compiler.runAsync();
      const { errors } = stats.compilation;
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /ESLint configuration in --config is invalid/i,
      );
    });
  },
);
