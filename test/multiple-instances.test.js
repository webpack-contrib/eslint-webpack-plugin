import { join } from "node:path";
import LintPlugin from "../src";
import pack from "./utils/pack";

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
                  __dirname,
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
                  __dirname,
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
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
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
                  __dirname,
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
                  __dirname,
                  "./config-for-tests/eslint.config.mjs",
                ),
                ignore: false,
              },
            ],
          }),
        ],
      },
    );

    await expect(compiler.runAsync()).rejects.toThrow("error.js");
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
                  __dirname,
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
                  __dirname,
                  "./config-for-tests/eslint.config.mjs",
                ),
                ignore: false,
              },
            ],
          }),
        ],
      },
    );

    await expect(compiler.runAsync()).rejects.toThrow("error.js");
  });
});
