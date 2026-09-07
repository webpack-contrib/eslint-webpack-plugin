import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("fail on config", () => {
  it("fails when .stylelintrc is not a proper format", async () => {
    const configFile = join(import.meta.dirname, ".badstylelintrc");
    const compiler = pack("error", { configFile });
    const stats = await compiler.runAsync();
    const { errors } = stats.compilation;
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(errors.length, 1);
  });
});
