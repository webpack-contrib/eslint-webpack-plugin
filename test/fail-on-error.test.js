import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("fail on error", () => {
  it("should emits errors", async () => {
    const compiler = pack("error", { failOnError: true });

    await assert.rejects(compiler.runAsync(), /error/u);
  });

  it("should emit warnings when disabled", async () => {
    const compiler = pack("error", { failOnError: false });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasErrors(), true);
  });

  it("should correctly identifies a success", async () => {
    const compiler = pack("good", { failOnError: true });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasErrors(), false);
  });
});
