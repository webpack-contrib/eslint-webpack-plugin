import { join } from "path";
import { writeFileSync } from "fs";

import { removeSync } from "fs-extra";

import pack from "./utils/pack";

const target = join(__dirname, "fixtures", "lint-dirty-modules-only-entry.js");

describe("lint dirty modules only", () => {
  let watch;
  afterEach(() => {
    if (watch) {
      watch.close();
    }
    removeSync(target);
  });

  it("skips linting on initial run", (done) => {
    writeFileSync(target, "const foo = false\n");

    let next = firstPass;
    const compiler = pack("lint-dirty-modules-only", {
      lintDirtyModulesOnly: true,
    });
    watch = compiler.watch({}, (err, stats) => next(err, stats));

    function firstPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);

      next = secondPass;

      writeFileSync(target, "const bar = false;\n");
    }

    function secondPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors.length).toBe(1);
      const [{ message }] = errors;
      expect(message).toEqual(expect.stringMatching("no-unused-vars"));
      done();
    }
  });
});
