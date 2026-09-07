import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("error", () => {
  it("should return error if file is bad", async () => {
    const compiler = pack("error");

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
  });

  it("should propagate eslint exceptions as errors", async () => {
    const eslintPath = join(import.meta.dirname, "mock/eslint-error");
    const compiler = pack("good", { eslintPath });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
    assert.ok(stats.compilation.errors[0].message.includes("Oh no!"));
  });
});
