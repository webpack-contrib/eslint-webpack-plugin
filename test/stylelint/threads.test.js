import { createRequire } from "node:module";
import { join } from "node:path";

import { jest } from "@jest/globals";

// @ts-expect-error no types
import normalizePath from "normalize-path";

import { getLoadedStylelint } from "../../src/linters/stylelint";

import pack from "./utils/pack";

const require = createRequire(import.meta.url);

describe("Threading", () => {
  it("should don't throw error if file is ok with threads", async () => {
    const compiler = pack("good", { threads: 2 });
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it("threaded interface should look like non-threaded interface", async () => {
    const single = getLoadedStylelint("single", {});
    const threaded = getLoadedStylelint("threaded", { threads: 2 });
    for (const key of Object.keys(single)) {
      expect(typeof single[key]).toEqual(typeof threaded[key]);
    }

    expect(single.lintFiles).not.toBe(threaded.lintFiles);
    expect(single.cleanup).not.toBe(threaded.cleanup);

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
      expect(good[0].errored).toBe(false);
      expect(bad[0].errored).toBe(true);
    } finally {
      threaded.cleanup();
    }
  });

  describe("worker coverage", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it("worker can start", async () => {
      const mockStylelintPath = join(
        import.meta.dirname,
        "mock/stylelint-recorder",
      );

      // Clear any previous calls
      const mock = require(mockStylelintPath);

      mock._reset();

      // Now require the worker (fresh copy due to resetModules)
      const {
        lintFiles,
        setup,
      } = require("../../src/linters/stylelint-worker.cjs");

      setup({ stylelintPath: mockStylelintPath });

      await lintFiles("foo");

      expect(mock._calls[0]).toMatchObject({
        files: "foo",
        quietDeprecationWarnings: true,
      });
    });
  });
});
