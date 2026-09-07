import assert from "node:assert/strict";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("circular plugin", () => {
  it("should support plugins with circular configs", async () => {
    const plugin = {
      configs: {},
      rules: {},
      processors: {},
    };

    Object.assign(plugin.configs, {
      recommended: {
        plugins: {
          self: plugin,
        },
        rules: {},
      },
    });

    const loaderOptions = {
      overrideConfig: {
        plugins: { plugin },
      },
      overrideConfigFile: true,
    };

    const compiler = pack("good", loaderOptions);

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });
});
