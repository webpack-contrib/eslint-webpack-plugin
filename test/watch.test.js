import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const target = join(import.meta.dirname, "fixtures", "watch-entry.js");
const target2 = join(import.meta.dirname, "fixtures", "watch-leaf.js");
const targetPattern = new RegExp(target.replaceAll("\\", "\\\\"), "u");

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
    writeFileSync(target, "var foo = stuff\n");

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
      assert.match(message, targetPattern);
      assert.match(message, /no-unused-vars/u);
      // `prefer-const` fails here
      assert.match(message, /prefer-const/u);
      assert.match(message, /\(4 errors,/u);

      next = finish;

      writeFileSync(
        target,
        "/* eslint-disable no-unused-vars */\nconst foo = false;\n",
      );
    }

    function secondPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      const { errors } = stats.compilation;
      assert.strictEqual(errors.length, 1);
      const [{ message }] = errors;
      assert.match(message, targetPattern);
      assert.match(message, /no-unused-vars/u);
      // `prefer-const` passes here
      assert.match(message, /prefer-const/u);
      assert.match(message, /\(4 errors,/u);

      next = thirdPass;

      writeFileSync(
        target,
        "const x = require('./watch-leaf')\nconst foo = 0\n",
      );
    }

    function firstPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasWarnings(), false);
      assert.strictEqual(stats.hasErrors(), true);
      const { errors } = stats.compilation;
      assert.strictEqual(errors.length, 1);
      const [{ message }] = errors;
      assert.match(message, targetPattern);
      assert.match(message, /\(3 errors,/u);

      next = secondPass;

      writeFileSync(target2, "let bar = false;\n");
      writeFileSync(
        target,
        "const x = require('./watch-leaf')\n\nconst foo = false;\n",
      );
    }
  });
});
