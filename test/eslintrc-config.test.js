import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import { ESLint } from "eslint";

import pack from "./utils/pack.js";

(ESLint && Number.parseFloat(ESLint.version) >= 10 ? describe.skip : describe)(
  "succeed on eslintrc-configuration",
  () => {
    it("should work with eslintrc configuration type", async () => {
      const overrideConfigFile = join(
        import.meta.dirname,
        "fixtures",
        "eslintrc-config.js",
      );
      const compiler = pack("full-of-problems", {
        configType: "eslintrc",
        overrideConfigFile,
      });

      const stats = await compiler.runAsync();
      const { errors } = stats.compilation;

      assert.strictEqual(stats.hasErrors(), true);
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].message.includes("full-of-problems.js"));
      assert.strictEqual(stats.hasWarnings(), true);
    });
  },
);
