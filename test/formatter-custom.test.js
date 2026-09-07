import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";

import pack from "./utils/pack.js";

const require = createRequire(import.meta.url);

describe("formatter eslint", () => {
  it("should use custom formatter as function", async () => {
    const formatter = require("./mock/formatter");

    const compiler = pack("error", { formatter });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
    assert.ok(stats.compilation.errors[0].message);
    const message = JSON.parse(
      stats.compilation.errors[0].message.replace("[eslint] ", ""),
    );
    assert.strictEqual(message.formatter, "mock");
    assert.ok(message.results);
  });

  it("should use custom formatter as string", async () => {
    const formatter = "./test/mock/formatter/index.js";
    const compiler = pack("error", { formatter });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
    assert.ok(stats.compilation.errors[0].message);
    const message = JSON.parse(
      stats.compilation.errors[0].message.replace("[eslint] ", ""),
    );
    assert.strictEqual(message.formatter, "mock");
    assert.ok(message.results);
  });
});
