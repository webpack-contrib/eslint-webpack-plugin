import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("symbols", () => {
  it("should return error", async () => {
    const compiler = pack(
      "symbols",
      {},
      { context: join(import.meta.dirname, "fixtures/[symbols]") },
    );

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
  });
});
