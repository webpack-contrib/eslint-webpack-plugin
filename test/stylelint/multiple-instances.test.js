import assert from "node:assert/strict";
import { describe, it } from "node:test";

import DiagnosticsPlugin from "../../src/index.js";

import pack from "./utils/pack.js";

describe("multiple instances", () => {
  it("should don't fail", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new DiagnosticsPlugin({
            exclude: "error.scss",
            checks: [{ use: "stylelint" }],
          }),
          new DiagnosticsPlugin({
            exclude: "error.scss",
            checks: [{ use: "stylelint" }],
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
            exclude: "good.scss",
            checks: [{ use: "stylelint" }],
          }),
          new DiagnosticsPlugin({
            exclude: "error.scss",
            checks: [{ use: "stylelint" }],
          }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
  });

  it("should fail on second instance", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new DiagnosticsPlugin({
            exclude: "error.scss",
            checks: [{ use: "stylelint" }],
          }),
          new DiagnosticsPlugin({
            exclude: "good.scss",
            checks: [{ use: "stylelint" }],
          }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
  });
});
