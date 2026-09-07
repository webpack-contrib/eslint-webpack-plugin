import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import LintPlugin from "../src/index.js";

import pack from "./utils/pack.js";

describe("multiple instances", () => {
  it("should don't fail", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new LintPlugin({
            failOnError: true,
            exclude: "error.js",
            linters: [
              {
                use: "eslint",
                overrideConfigFile: join(
                  import.meta.dirname,
                  "./config-for-tests/eslint.config.mjs",
                ),
                ignore: false,
              },
            ],
          }),
          new LintPlugin({
            failOnError: true,
            exclude: "error.js",
            linters: [
              {
                use: "eslint",
                overrideConfigFile: join(
                  import.meta.dirname,
                  "./config-for-tests/eslint.config.mjs",
                ),
                ignore: false,
              },
            ],
          }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should fail on first instance", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new LintPlugin({
            failOnError: true,
            exclude: "good.js",
            linters: [
              {
                use: "eslint",
                overrideConfigFile: join(
                  import.meta.dirname,
                  "./config-for-tests/eslint.config.mjs",
                ),
                ignore: false,
              },
            ],
          }),
          new LintPlugin({
            failOnError: true,
            exclude: "error.js",
            linters: [
              {
                use: "eslint",
                overrideConfigFile: join(
                  import.meta.dirname,
                  "./config-for-tests/eslint.config.mjs",
                ),
                ignore: false,
              },
            ],
          }),
        ],
      },
    );

    await assert.rejects(compiler.runAsync(), /error\.js/u);
  });

  it("should fail on second instance", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new LintPlugin({
            failOnError: true,
            exclude: "error.js",
            linters: [
              {
                use: "eslint",
                overrideConfigFile: join(
                  import.meta.dirname,
                  "./config-for-tests/eslint.config.mjs",
                ),
                ignore: false,
              },
            ],
          }),
          new LintPlugin({
            failOnError: true,
            exclude: "good.js",
            linters: [
              {
                use: "eslint",
                overrideConfigFile: join(
                  import.meta.dirname,
                  "./config-for-tests/eslint.config.mjs",
                ),
                ignore: false,
              },
            ],
          }),
        ],
      },
    );

    await assert.rejects(compiler.runAsync(), /error\.js/u);
  });
});
