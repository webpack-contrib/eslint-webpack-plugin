import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("query", () => {
  it("should correctly resolve file despite query path", async () => {
    const compiler = pack(
      "query",
      {},
      {
        resolve: {
          alias: {
            "alias-ignore": false,
          },
        },
      },
    );

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });
});
