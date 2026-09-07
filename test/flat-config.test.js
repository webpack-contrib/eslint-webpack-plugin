import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("succeed on flat-configuration", () => {
  it("should work with flat configuration type", async () => {
    const overrideConfigFile = join(
      import.meta.dirname,
      "fixtures",
      "flat-config.js",
    );
    const compiler = pack("full-of-problems", {
      configType: "flat",
      overrideConfigFile,
    });

    const stats = await compiler.runAsync();
    const { errors } = stats.compilation;

    assert.strictEqual(stats.hasErrors(), true);
    assert.strictEqual(errors.length, 1);
    assert.match(errors[0].message, /full-of-problems\.js/i);
    assert.strictEqual(stats.hasWarnings(), true);
  });
});
