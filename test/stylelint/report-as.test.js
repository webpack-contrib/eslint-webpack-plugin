import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("report as", () => {
  it("should leave each result at its own severity by default", async () => {
    const compiler = pack("full-of-problems", {});

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(stats.hasWarnings(), true);
  });

  it("should report everything as errors when set to the errors", async () => {
    const compiler = pack("full-of-problems", { reportAs: "error" });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(stats.hasWarnings(), false);
  });

  it("should report everything as warnings when set to the warnings", async () => {
    const compiler = pack("full-of-problems", { reportAs: "warning" });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
    assert.strictEqual(stats.hasWarnings(), true);
  });

  it("should report nothing when set to false", async () => {
    const compiler = pack("full-of-problems", { reportAs: false });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
    assert.strictEqual(stats.hasWarnings(), false);
  });

  it("should let a clean build pass whatever it is set to", async () => {
    const compiler = pack("good", { reportAs: "error" });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
    assert.strictEqual(stats.hasWarnings(), false);
  });
});
