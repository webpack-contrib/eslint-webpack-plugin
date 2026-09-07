import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("emit warning", () => {
  it("should not emit warnings if emitWarning is false", async () => {
    const compiler = pack("warn", { emitWarning: false });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
  });

  it("should emit warnings if emitWarning is undefined", async () => {
    const compiler = pack("warn", {});

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), true);
  });

  it("should emit warnings if emitWarning is true", async () => {
    const compiler = pack("warn", { emitWarning: true });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), true);
  });

  it("should emit warnings, but not warnings if emitWarning is true and emitError is false", async () => {
    const compiler = pack("full-of-problems", {
      emitWarning: true,
      emitError: false,
    });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), true);
    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should emit warnings and errors if emitWarning is true and emitError is undefined", async () => {
    const compiler = pack("full-of-problems", { emitWarning: true });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), true);
    assert.strictEqual(stats.hasErrors(), true);
  });
});
