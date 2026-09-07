import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getStylelintOptions } from "../../src/linters/stylelint.js";

describe("eslint options", () => {
  it("should filter plugin options", () => {
    const options = {
      formatter: "json",
      emitError: false,
    };
    assert.deepStrictEqual(getStylelintOptions(options), {
      formatter: "json",
    });
  });

  it("should keep the stylelint options", () => {
    const options = {
      stylelintPath: "some/place/where/stylelint/lives",
      formatter: "json",
      files: ["file.scss"],
      emitError: false,
      emitWarning: false,
      failOnError: true,
      failOnWarning: true,
      quiet: false,
      outputReport: true,
    };
    assert.deepStrictEqual(getStylelintOptions(options), {
      formatter: "json",
      files: ["file.scss"],
    });
  });
});
