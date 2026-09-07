import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import webpack from "webpack";

import LintPlugin from "../src/index.js";

describe("empty", () => {
  it("no error when no files matching", (t, done) => {
    const compiler = webpack({
      context: join(import.meta.dirname, "fixtures", "empty"),
      mode: "development",
      entry: "../",
      plugins: [new LintPlugin({ linters: [{ use: "eslint" }] })],
    });

    compiler.run((err, stats) => {
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), false);
      done();
    });
  });
});
