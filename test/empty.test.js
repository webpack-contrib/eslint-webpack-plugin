import { join } from "node:path";

import webpack from "webpack";

import LintPlugin from "../src";

describe("empty", () => {
  it("no error when no files matching", (done) => {
    const compiler = webpack({
      context: join(__dirname, "fixtures", "empty"),
      mode: "development",
      entry: "../",
      plugins: [new LintPlugin({ eslint: true })],
    });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
