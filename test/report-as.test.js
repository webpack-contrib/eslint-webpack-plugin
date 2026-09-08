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

  it("should keep the default when written out as undefined", async () => {
    const compiler = pack("full-of-problems", { reportAs: undefined });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(stats.hasWarnings(), true);
  });

  it("should fail the build on the errors it reports", async () => {
    const failing = await pack("error", {}).runAsync();
    const passing = await pack("error", { reportAs: "warning" }).runAsync();

    assert.strictEqual(failing.hasErrors(), true);
    assert.strictEqual(passing.hasErrors(), false);
    assert.strictEqual(passing.hasWarnings(), true);
  });

  it("should fail the build on a warning set to the errors", async () => {
    const stats = await pack("warn", { reportAs: "error" }).runAsync();

    assert.strictEqual(stats.hasErrors(), true);
  });

  it("should ignore the warnings when quiet is set", async () => {
    const stats = await pack("full-of-problems", {
      reportAs: "error",
      quiet: true,
    }).runAsync();

    assert.strictEqual(stats.compilation.errors.length, 1);
    assert.doesNotMatch(
      stats.compilation.errors[0].message,
      /^\s+\d+:\d+\s+warning/mu,
    );
  });

  it("should let a clean build pass whatever it is set to", async () => {
    for (const reportAs of ["error", "warning", false]) {
      const stats = await pack("good", { reportAs }).runAsync();

      assert.strictEqual(stats.hasErrors(), false);
      assert.strictEqual(stats.hasWarnings(), false);
    }
  });

  it("should reject anything but a severity or false", () => {
    for (const reportAs of [true, "info", [], ["error"], { error: "error" }]) {
      assert.throws(
        () => pack("full-of-problems", { reportAs }),
        /reportAs should be one of these:\n *"error" \| "warning" \| false/u,
      );
    }
  });
});
