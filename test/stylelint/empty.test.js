import assert from "node:assert/strict";
import { describe, it } from "node:test";

import LintPlugin from "../../src/index.js";

import pack from "./utils/pack.js";

describe("empty", () => {
  it("no error when no files matching", async () => {
    const compiler = pack(
      "empty",
      {},
      {
        plugins: [new LintPlugin({ linters: [{ use: "stylelint" }] })],
      },
    );
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });
});
