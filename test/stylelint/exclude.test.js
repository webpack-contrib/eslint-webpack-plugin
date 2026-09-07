import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("exclude", () => {
  it("should exclude with globs", async () => {
    const compiler = pack("exclude", { exclude: ["*test*"] });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should exclude files", async () => {
    const compiler = pack("exclude", { exclude: ["test.scss"] });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should exclude folders", async () => {
    const compiler = pack("exclude-folder", { exclude: ["folder"] });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });
});
