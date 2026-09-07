import assert from "node:assert/strict";
import { describe, it } from "node:test";

import LintError from "../src/LintError.js";

import pack from "./utils/pack.js";

describe("eslintignore", () => {
  it("should ignores files present in .eslintignore", async () => {
    const compiler = pack("ignore", {
      ignore: true,
      ignorePatterns: ["**/ignore.js"],
    });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.deepStrictEqual(
      stats.compilation.errors.filter((x) => x instanceof LintError),
      [],
    );
  });
});
