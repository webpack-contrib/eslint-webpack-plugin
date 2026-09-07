import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("eslint path", () => {
  it("should use another instance of eslint via eslintPath config", async () => {
    const eslintPath = join(import.meta.dirname, "mock/eslint");
    const compiler = pack("good", { eslintPath });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
    assert.ok(stats.compilation.errors[0].message.includes("Fake error"));
  });
});
