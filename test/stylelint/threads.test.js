import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";

// @ts-expect-error no types
import normalizePath from "normalize-path";

import { getLoadedStylelint } from "../../src/linters/stylelint.js";

import pack from "./utils/pack.js";

const require = createRequire(import.meta.url);

describe("Threading", () => {
  it("should don't throw error if file is ok with threads", async () => {
    const compiler = pack("good", { threads: 2 });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });

  it("threaded interface should look like non-threaded interface", async () => {
    const single = getLoadedStylelint("single", {});
    const threaded = getLoadedStylelint("threaded", { threads: 2 });
    for (const key of Object.keys(single)) {
      assert.deepStrictEqual(typeof single[key], typeof threaded[key]);
    }

    assert.notStrictEqual(single.lintFiles, threaded.lintFiles);
    assert.notStrictEqual(single.cleanup, threaded.cleanup);

    single.cleanup();
    threaded.cleanup();
  });

  it("threaded should lint files", async () => {
    const threaded = getLoadedStylelint("bar", { threads: true });
    try {
      const [good, bad] = await Promise.all([
        threaded.lintFiles(
          normalizePath(join(import.meta.dirname, "fixtures/good/test.scss")),
        ),
        threaded.lintFiles(
          normalizePath(join(import.meta.dirname, "fixtures/error/test.scss")),
        ),
      ]);
      assert.strictEqual(good[0].errored, false);
      assert.strictEqual(bad[0].errored, true);
    } finally {
      threaded.cleanup();
    }
  });

  describe("worker coverage", () => {
    beforeEach(() => {
      // The worker holds its stylelint path in module state, so drop the copy
      // a previous test set up.
      delete require.cache[
        require.resolve("../../src/linters/stylelint-worker.cjs")
      ];
    });

    it("worker can start", async () => {
      const mockStylelintPath = join(
        import.meta.dirname,
        "mock/stylelint-recorder",
      );

      // Clear any previous calls
      const mock = require(mockStylelintPath);

      mock._reset();

      const {
        lintFiles,
        setup,
      } = require("../../src/linters/stylelint-worker.cjs");

      setup({ stylelintPath: mockStylelintPath });

      await lintFiles("foo");

      const [call] = mock._calls;

      assert.strictEqual(call.files, "foo");
      assert.strictEqual(call.quietDeprecationWarnings, true);
    });
  });
});
