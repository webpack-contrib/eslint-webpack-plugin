import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("quiet", () => {
  it("should not emit warnings if quiet is set", async () => {
    const compiler = pack("warning", { quiet: true });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should emit errors, but not emit warnings if quiet is set", async () => {
    const compiler = pack("full-of-problems", { quiet: true });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
  });
});
