import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const target = join(
  import.meta.dirname,
  "fixtures",
  "lint-dirty-modules-only-entry.js",
);

describe("lint dirty modules only", () => {
  let watch;

  afterEach(() => {
    if (watch) {
      watch.close();
    }
    rmSync(target, { force: true, recursive: true });
  });

  it("skips linting on initial run", (t, done) => {
    writeFileSync(target, "const foo = false\n");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("lint-dirty-modules-only", {
      lintDirtyModulesOnly: true,
    });
    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function secondPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      const { errors } = stats.compilation;
      assert.strictEqual(errors.length, 1);
      assert.match(stats.compilation.errors[0].message, /no-unused-vars/u);
      done();
    }

    function firstPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), false);

      next = secondPass;

      writeFileSync(target, "const bar = false;\n");
    }
  });
});
