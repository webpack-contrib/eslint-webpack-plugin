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

// Webpack starts a rebuild of its own for a file these tests wrote just before
// the watch began, so each one waits for the state it is after rather than
// counting the passes up to it. A state that never arrives ends as a timeout.
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

    const compiler = pack("watch");
    let fixing = true;

    watch = compiler.watch({}, (err, stats) => {
      assert.strictEqual(err, null);

      if (fixing) {
        const [{ message }] = stats.compilation.errors;

        assert.match(message, /orphan\.ts/u);
        assert.match(message, /TS2322/u);

        fixing = false;
        writeFileSync(orphan, "export const wrong: number = 42;\n");

        return;
      }

      if (stats.hasErrors()) return;

      done();
    });
  });

  it("should rebuild when the config file changes", (t, done) => {
    writeConfig(false);
    writeFileSync(trigger, "export const trigger = 1;\n");
    writeFileSync(orphan, "export const same = (value) => value;\n");

    const compiler = pack("watch");
    let tightening = true;

    watch = compiler.watch({}, (err, stats) => {
      assert.strictEqual(err, null);

      if (tightening) {
        assert.strictEqual(stats.hasErrors(), false);

        tightening = false;
        writeConfig(true);

        return;
      }

      if (!stats.hasErrors()) return;

      const [{ message }] = stats.compilation.errors;

      // The file did not change; what the config file asks of it did.
      assert.match(message, /orphan\.ts/u);
      assert.match(message, /TS7006/u);
      done();
    });
  });
});
