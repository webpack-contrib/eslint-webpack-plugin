import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("stylelint path", () => {
  it("should use another instance of stylelint via stylelintPath config", async () => {
    const stylelintPath = join(import.meta.dirname, "mock/stylelint");
    const compiler = pack("stylelint-path", { stylelintPath });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
    assert.ok(stats.compilation.errors[0].message.includes("Fake error"));
  });
});
