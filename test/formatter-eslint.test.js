import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("formatter eslint", () => {
  it("should use eslint formatter", async () => {
    const compiler = pack("error");

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
    assert.ok(stats.compilation.errors[0].message);
  });
});
