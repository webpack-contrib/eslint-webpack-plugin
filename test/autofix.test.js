import assert from "node:assert/strict";
import { cpSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("autofix stop", () => {
  const entry = join(import.meta.dirname, "fixtures/fixable-clone.js");

  before(() => {
    cpSync(join(import.meta.dirname, "fixtures/fixable.js"), entry);
  });

  after(() => {
    rmSync(entry, { force: true, recursive: true });
  });

  it("should not throw error if file ok after auto-fixing", async () => {
    const compiler = pack("fixable-clone", {
      fix: true,
      extensions: ["js", "cjs", "mjs"],
      overrideConfig: {
        rules: { semi: ["error", "always"] },
      },
    });

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
    assert.strictEqual(
      readFileSync(entry).toString("utf8"),
      "function foo() {\n  return true;\n}\n\nfoo();\n",
    );
  });
});
