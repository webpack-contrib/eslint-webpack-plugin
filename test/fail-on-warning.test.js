import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("fail on warning", () => {
  it("should emits errors", async () => {
    const compiler = pack("warn", { failOnWarning: true });

    await assert.rejects(compiler.runAsync(), /warning/u);
  });

  it("should correctly identifies a success", async () => {
    const compiler = pack("good", { failOnWarning: true });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasErrors(), false);
  });
});
