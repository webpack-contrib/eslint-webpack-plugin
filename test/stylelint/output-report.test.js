import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("output report", () => {
  it("should output report a default formatter", async () => {
    const filePath = "report.txt";
    const compiler = pack("error", {
      outputReport: { filePath },
    });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(existsSync(join(compiler.outputPath, filePath)), true);
  });

  it("should output report with a custom formatter", async () => {
    const filePath = join(import.meta.dirname, "outputs", "report.json");
    const compiler = pack("error", {
      outputReport: {
        filePath,
        formatter: "json",
      },
    });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(existsSync(filePath), true);
    const report = JSON.parse(readFileSync(filePath, "utf8"));

    assert.strictEqual(report.length, 1);
    assert.ok(report[0].source.includes("test.scss"));
  });
});
