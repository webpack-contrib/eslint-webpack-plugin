import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import webpack from "webpack";

import conf from "./utils/conf.js";

describe("formatter write", () => {
  it("should write results to relative file with a custom formatter", (t, done) => {
    const outputFilename = "outputReport-relative.txt";
    const config = conf("error", {
      formatter: "json",
      outputReport: {
        formatter: "json",
        filePath: outputFilename,
      },
    });

    const outputFilepath = join(config.output.path, outputFilename);
    rmSync(outputFilepath, { force: true, recursive: true });

    const compiler = webpack(config);
    compiler.run((err, stats) => {
      const contents = readFileSync(outputFilepath, "utf8");

      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      assert.strictEqual(
        stats.compilation.errors[0].message,
        `[eslint] ${contents}`,
      );
      done();
    });
  });

  it("should write results to absolute file with a same formatter", (t, done) => {
    const outputFilename = "outputReport-absolute.txt";
    const outputFilepath = join(import.meta.dirname, "outputs", outputFilename);
    const config = conf("error", {
      outputReport: {
        filePath: outputFilepath,
      },
    });

    rmSync(outputFilepath, { force: true, recursive: true });

    const compiler = webpack(config);
    compiler.run((err, stats) => {
      const contents = readFileSync(outputFilepath, "utf8");

      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      assert.strictEqual(
        stats.compilation.errors[0].message,
        `[eslint] ${contents}`,
      );
      done();
    });
  });
});
