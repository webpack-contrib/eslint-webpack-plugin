import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("fail on error", () => {
  it("should fail the build", async () => {
    const compiler = pack("error", { failOnError: true });

    await assert.rejects(compiler.runAsync(), /color-named/u);
  });

  it("should report errors without failing when disabled", async () => {
    const compiler = pack("error", { failOnError: false });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasErrors(), true);
  });

  it("should correctly identify a success", async () => {
    const compiler = pack("good", { failOnError: true });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasErrors(), false);
  });
});
