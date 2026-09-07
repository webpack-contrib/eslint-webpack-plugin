import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getESLintOptions } from "../src/checks/eslint.js";

describe("eslint options", () => {
  it("should filter loader options", () => {
    const options = {
      formatter: "table",
      ignore: false,
    };
    assert.deepStrictEqual(getESLintOptions(options), {
      ignore: false,
    });
  });

  it("should keep the fix option", () => {
    // The fix option should be kept because it is common to both the loader and ESLint.
    const options = {
      eslintPath: "some/place/where/eslint/lives",
      formatter: "table",
      fix: true,
      emit: false,
      failOn: ["error"],
      quiet: false,
      outputReport: true,
    };
    assert.deepStrictEqual(getESLintOptions(options), {
      fix: true,
    });
  });
});
