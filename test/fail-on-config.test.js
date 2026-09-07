import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import { ESLint } from "eslint";

import pack from "./utils/pack.js";

(ESLint && Number.parseFloat(ESLint.version) >= 10 ? describe.skip : describe)(
  "fail on config",
  () => {
    it("fails when .eslintrc is not a proper format", async () => {
      const overrideConfigFile = join(import.meta.dirname, ".badeslintrc");
      const compiler = pack("error", {
        configType: "eslintrc",
        overrideConfigFile,
      });

      const stats = await compiler.runAsync();
      const { errors } = stats.compilation;
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      assert.strictEqual(errors.length, 1);
      assert.match(
        errors[0].message,
        /ESLint configuration in --config is invalid/i,
      );
    });
  },
);
