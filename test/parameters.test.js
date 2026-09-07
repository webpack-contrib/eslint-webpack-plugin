import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("parameters", () => {
  it("should supports query strings parameters", async () => {
    const loaderOptions = {
      overrideConfig: {
        rules: { semi: 0 },
      },
    };
    const compiler = pack("good", loaderOptions);

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });
});
