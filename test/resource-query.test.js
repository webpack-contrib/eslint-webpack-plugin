import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("resource-query", () => {
  it("should exclude the match resource query", async () => {
    const compiler = pack(
      "resource-query",
      {
        resourceQueryExclude: /media/,
        extensions: [".js", ".ts"],
      },
      {
        module: { rules: [{ resourceQuery: /media/, type: "asset/source" }] },
      },
    );

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });
});
