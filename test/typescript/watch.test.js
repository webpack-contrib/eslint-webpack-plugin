import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const fixture = join(import.meta.dirname, "fixtures", "watch");
const orphan = join(fixture, "orphan.ts");
const configFile = join(fixture, "tsconfig.json");
// Something webpack does build, so that a rebuild can be asked for without
// touching the files under test.
const trigger = join(fixture, "trigger.js");

/**
 * @param {boolean} strict whether the project is checked strictly
 */
function writeConfig(strict) {
  writeFileSync(
    configFile,
    `${JSON.stringify(
      {
        compilerOptions: {
          strict,
          target: "es2022",
          module: "preserve",
          skipLibCheck: true,
        },
        include: ["*.ts"],
      },
      null,
      2,
    )}\n`,
  );
}

describe("watch", () => {
  let watch;

  afterEach(() => {
    if (watch) {
      watch.close();
    }
    rmSync(orphan, { force: true });
    rmSync(configFile, { force: true });
    rmSync(trigger, { force: true });
  });

  it("should rebuild when a file only the program holds changes", (t, done) => {
    writeConfig(true);
    writeFileSync(trigger, "export const trigger = 1;\n");
    writeFileSync(orphan, "export const wrong: string = 42;\n");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("watch");

    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function secondPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasErrors(), false);
      done();
    }

    function firstPass(err, stats) {
      assert.strictEqual(err, null);

      const [{ message }] = stats.compilation.errors;

      assert.match(message, /orphan\.ts/u);
      assert.match(message, /TS2322/u);

      next = secondPass;
      writeFileSync(orphan, "export const wrong: number = 42;\n");
    }
  });

  it("should rebuild when the config file changes", (t, done) => {
    writeConfig(false);
    writeFileSync(trigger, "export const trigger = 1;\n");
    writeFileSync(orphan, "export const same = (value) => value;\n");

    // eslint-disable-next-line no-use-before-define
    let next = firstPass;
    const compiler = pack("watch");

    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function secondPass(err, stats) {
      assert.strictEqual(err, null);

      const [{ message }] = stats.compilation.errors;

      // The file did not change; what the config file asks of it did.
      assert.match(message, /orphan\.ts/u);
      assert.match(message, /TS7006/u);
      done();
    }

    function firstPass(err, stats) {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasErrors(), false);

      next = secondPass;
      writeConfig(true);
    }
  });
});
