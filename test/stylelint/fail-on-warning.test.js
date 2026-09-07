import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("fail on warning", () => {
  it("should fail the build", async () => {
    const compiler = pack("warning", { failOnWarning: true });

    await assert.rejects(compiler.runAsync(), /color-hex-length/u);
  });

  it("should correctly identify a success", async () => {
    const compiler = pack("good", { failOnWarning: true });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasErrors(), false);
  });
});
