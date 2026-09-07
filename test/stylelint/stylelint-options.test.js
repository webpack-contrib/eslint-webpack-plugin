import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getStylelintOptions } from "../../src/checks/stylelint.js";

describe("eslint options", () => {
  it("should filter plugin options", () => {
    const options = {
      formatter: "json",
      emit: false,
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
      emit: false,
      failOn: ["error"],
      quiet: false,
      outputReport: true,
    };
    assert.deepStrictEqual(getStylelintOptions(options), {
      formatter: "json",
      files: ["file.scss"],
    });
  });
});
