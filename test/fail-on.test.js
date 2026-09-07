import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("fail on", () => {
  it("should fail on an error when set to the errors", async () => {
    const compiler = pack("error", { failOn: "error" });

    await assert.rejects(compiler.runAsync(), /error/u);
  });

  it("should not fail on an error when set to false", async () => {
    const compiler = pack("error", { failOn: false });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), true);
  });

  it("should not fail on a warning when set to the errors", async () => {
    const compiler = pack("warn", { failOn: "error" });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasWarnings(), true);
  });

  it("should fail on either severity when set to the warnings", async () => {
    await assert.rejects(
      pack("warn", { failOn: "warning" }).runAsync(),
      /warning/u,
    );
    await assert.rejects(
      pack("error", { failOn: "warning" }).runAsync(),
      /error/u,
    );
  });

  it("should not fail on what emit does not report", async () => {
    const compiler = pack("warn", { emit: "error", failOn: "warning" });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasWarnings(), false);
  });

  it("should let a clean build pass whatever it is set to", async () => {
    const compiler = pack("good", { failOn: "warning" });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
    assert.strictEqual(stats.hasWarnings(), false);
  });
});
