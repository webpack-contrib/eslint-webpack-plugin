import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const target = join(import.meta.dirname, "fixtures/run-on/test.scss");

describe("run on", () => {
  let watch;

  afterEach(() => {
    if (watch) watch.close();
    rmSync(target, { force: true });
  });

  it("should not run for a build when set to watch", async () => {
    writeFileSync(target, "#stuff { background: black; }\n");

    const stats = await pack("run-on", { runOn: "watch" }).runAsync();

    assert.strictEqual(stats.hasErrors(), false);
    assert.strictEqual(stats.hasWarnings(), false);
  });

  it("should run for a build when set to build", async () => {
    writeFileSync(target, "#stuff { background: black; }\n");

    const stats = await pack("run-on", { runOn: "build" }).runAsync();

    assert.strictEqual(stats.hasErrors(), true);
    assert.match(stats.compilation.errors[0].message, /color-named/u);
  });

  it("should not run for a watch run when set to build", (t, done) => {
    writeFileSync(target, "#stuff { background: black; }\n");

    const compiler = pack("run-on", { runOn: "build" });

    watch = compiler.watch({}, (err, stats) => {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasErrors(), false);
      done();
    });
  });

  it("should run for a watch run when set to watch", (t, done) => {
    writeFileSync(target, "#stuff { background: black; }\n");

    const compiler = pack("run-on", { runOn: "watch" });

    watch = compiler.watch({}, (err, stats) => {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasErrors(), true);
      assert.match(stats.compilation.errors[0].message, /color-named/u);
      done();
    });
  });
});
