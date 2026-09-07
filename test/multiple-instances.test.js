import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import DiagnosticsPlugin from "../src/index.js";

import pack from "./utils/pack.js";

describe("multiple instances", () => {
  it("should don't fail", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new DiagnosticsPlugin({
            exclude: "error.js",
            checks: [
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
          new DiagnosticsPlugin({
            exclude: "error.js",
            checks: [
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
          new DiagnosticsPlugin({
            exclude: "good.js",
            checks: [
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
          new DiagnosticsPlugin({
            exclude: "error.js",
            checks: [
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

    assert.strictEqual(stats.hasErrors(), true);
    assert.match(stats.compilation.errors[0].message, /error\.js/u);
  });

  it("should fail on second instance", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new DiagnosticsPlugin({
            exclude: "error.js",
            checks: [
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
          new DiagnosticsPlugin({
            exclude: "good.js",
            checks: [
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

    assert.strictEqual(stats.hasErrors(), true);
    assert.match(stats.compilation.errors[0].message, /error\.js/u);
  });
});
