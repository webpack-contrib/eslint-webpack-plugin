import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const fixture = join(import.meta.dirname, "fixtures", "unbuilt");
const orphan = join(fixture, "orphan.scss");
// Something webpack does build, so that a rebuild can be asked for without
// touching the file under test.
const trigger = join(fixture, "trigger.js");

describe("unbuilt", () => {
  let watch;

  afterEach(() => {
    if (watch) {
      watch.close();
    }
    rmSync(orphan, { force: true });
    rmSync(trigger, { force: true });
  });

  it("should rebuild when a file webpack never built changes", (t, done) => {
    writeFileSync(trigger, "const trigger = 1;\n");
    writeFileSync(orphan, "#orphan { color: black; }\n");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("unbuilt");

    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function secondPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasErrors(), false);
      done();
    }

    function firstPass(err, stats) {
      assert.strictEqual(err, null);

      const [{ message }] = stats.compilation.errors;

      assert.match(message, /orphan\.scss/u);

      next = secondPass;
      writeFileSync(orphan, "#orphan { color: #000000; }\n");
    }
  });

  it("should find a file that appears after the watch started", (t, done) => {
    writeFileSync(trigger, "const trigger = 1;\n");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("unbuilt");

    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function secondPass(err, stats) {
      assert.strictEqual(err, null);

      const [{ message }] = stats.compilation.errors;

      assert.match(message, /orphan\.scss/u);
      done();
    }

    function firstPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasErrors(), false);

      next = secondPass;
      writeFileSync(orphan, "#orphan { color: black; }\n");
      writeFileSync(trigger, "const trigger = 2;\n");
    }
  });

  it("should stop reporting a file that is gone", (t, done) => {
    writeFileSync(trigger, "const trigger = 1;\n");
    writeFileSync(orphan, "#orphan { color: black; }\n");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("unbuilt");

    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function secondPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasErrors(), false);
      done();
    }

    function firstPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasErrors(), true);

      next = secondPass;
      rmSync(orphan, { force: true });
      writeFileSync(trigger, "const trigger = 2;\n");
    }
  });
});
