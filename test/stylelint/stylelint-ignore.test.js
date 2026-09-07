import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("stylelint ignore", () => {
  it("should ignore file", async () => {
    const compiler = pack("stylelint-ignore");
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });
});
