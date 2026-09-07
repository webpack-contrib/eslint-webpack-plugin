import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("error", () => {
  it("should return error if file is bad", async () => {
    const compiler = pack("error");
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
  });

  it("should propagate stylelint lint exceptions as errors", async () => {
    // Mock that throws when lint() is called
    const mockStylelintPath = join(import.meta.dirname, "mock/stylelint-error");

    const compiler = pack("good", { stylelintPath: mockStylelintPath });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
  });

  it("should propagate stylelint load exceptions as errors", async () => {
    // Mock that throws when the module is loaded
    const mockStylelintPath = join(
      import.meta.dirname,
      "mock/stylelint-load-error",
    );

    const compiler = pack("good", { stylelintPath: mockStylelintPath });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
  });
});
