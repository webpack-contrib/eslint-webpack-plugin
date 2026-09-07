import { join } from "node:path";

import webpack from "webpack";

import LintPlugin from "../src";

describe("empty", () => {
  it("no error when no files matching", (done) => {
    const compiler = webpack({
      context: join(import.meta.dirname, "fixtures", "empty"),
      mode: "development",
      entry: "../",
      plugins: [new LintPlugin({ linters: [{ use: "eslint" }] })],
    });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
