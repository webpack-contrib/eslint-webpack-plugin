import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const target = join(import.meta.dirname, "fixtures/lint-on-start/test.scss");

describe("lint on start", () => {
  let watch;

  afterEach(() => {
    if (watch) {
      watch.close();
    }
    rmSync(target, { force: true, recursive: true });
  });

  it("skips linting on initial run", (t, done) => {
    writeFileSync(target, "body { }\n");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("lint-on-start", {
      lintOnStart: false,
    });
    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function secondPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      const { errors } = stats.compilation;
      assert.strictEqual(errors.length, 1);
      const [{ message }] = errors;
      assert.match(message, /color-named/u);
      done();
    }

    function firstPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), false);

      next = secondPass;

      writeFileSync(target, "#stuff { background: black; }\n");
    }
  });

  it("still lints a build, which is nothing but a start", async () => {
    writeFileSync(target, "#stuff { background: black; }\n");

    const stats = await pack("lint-on-start", {
      lintOnStart: false,
    }).runAsync();

    assert.strictEqual(stats.hasErrors(), true);
    assert.match(stats.compilation.errors[0].message, /color-named/u);
  });
});
