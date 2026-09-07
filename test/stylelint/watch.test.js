import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const target = join(import.meta.dirname, "fixtures", "watch", "entry.scss");
const target2 = join(import.meta.dirname, "fixtures", "watch", "leaf.scss");

describe("watch", () => {
  let watch;

  afterEach(() => {
    if (watch) {
      watch.close();
    }
    rmSync(target, { force: true, recursive: true });
    rmSync(target2, { force: true, recursive: true });
  });

  it("should watch", (t, done) => {
    const compiler = pack("good");

    watch = compiler.watch({}, (err, stats) => {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), false);
      done();
    });
  });

  it("should watch with unique messages", (t, done) => {
    writeFileSync(target, "#foo { background: black; }\n");
    writeFileSync(target2, "");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("watch");
    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function finish(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), false);
      done();
    }

    function thirdPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      const { errors } = stats.compilation;
      assert.strictEqual(errors.length, 1);
      const [{ message }] = errors;
      assert.match(message, /entry.scss/u);
      assert.doesNotMatch(message, /leaf.scss/u);

      next = finish;
      writeFileSync(target, "#bar { background: #000000; }\n");
    }

    function secondPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      const { errors } = stats.compilation;
      assert.strictEqual(errors.length, 1);
      const [{ message }] = errors;
      assert.match(message, /entry.scss/u);
      assert.match(message, /leaf.scss/u);

      next = thirdPass;
      writeFileSync(target2, "#bar { background: #000000; }\n");
    }

    function firstPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      const { errors } = stats.compilation;
      assert.strictEqual(errors.length, 1);
      const [{ message }] = errors;
      assert.match(message, /entry.scss/u);
      assert.doesNotMatch(message, /leaf.scss/u);

      next = secondPass;
      writeFileSync(target2, "#bar { background: black; }\n");
      writeFileSync(target, "#foo { background: black; }\n");
    }
  });
});
