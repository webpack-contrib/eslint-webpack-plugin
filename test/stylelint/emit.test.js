import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("emit", () => {
  it("should report both severities by default", async () => {
    const compiler = pack("full-of-problems", {});

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(stats.hasWarnings(), true);
  });

  it("should report both severities when set to the warnings", async () => {
    const compiler = pack("full-of-problems", { emit: "warning" });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(stats.hasWarnings(), true);
  });

  it("should report the errors alone when set to them", async () => {
    const compiler = pack("full-of-problems", { emit: "error" });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(stats.hasWarnings(), false);
  });

  it("should report neither severity when set to false", async () => {
    const compiler = pack("full-of-problems", { emit: false });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
    assert.strictEqual(stats.hasWarnings(), false);
  });
});
