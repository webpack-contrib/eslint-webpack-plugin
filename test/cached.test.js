import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { after, beforeEach, describe, it } from "node:test";

import webpack from "webpack";

import conf from "./utils/conf.js";

describe("error (cached module)", () => {
  const cacheLocation = join(import.meta.dirname, "cache");

  beforeEach(() => {
    rmSync(cacheLocation, { force: true, recursive: true });
  });

  after(() => {
    rmSync(cacheLocation, { force: true, recursive: true });
  });

  it("should return error even if module is cached", (t, done) => {
    const config = conf("error");
    config.cache = {
      type: "filesystem",
      idleTimeout: 0,
      idleTimeoutAfterLargeChanges: 0,
      idleTimeoutForInitialStore: 0,
      cacheLocation,
    };

    const c1 = webpack(config);

    c1.run((err1, stats1) => {
      assert.strictEqual(err1, null);
      assert.strictEqual(stats1.hasWarnings(), false);
      assert.strictEqual(stats1.hasErrors(), true);

      c1.close(() => {
        const c2 = webpack(config);
        c2.run((err2, stats2) => {
          assert.strictEqual(err2, null);
          assert.strictEqual(stats2.hasWarnings(), false);
          assert.strictEqual(stats2.hasErrors(), true);

          done();
        });
      });
    });
  });
});
