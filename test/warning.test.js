import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("warning", () => {
  it("should emit warnings", async () => {
    const compiler = pack("warn");

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), true);
    assert.strictEqual(stats.hasErrors(), false);
  });
});
