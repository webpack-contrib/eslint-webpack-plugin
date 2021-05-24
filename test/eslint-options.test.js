import { getESLintOptions } from "../src/options";

describe("eslint options", () => {
  it("should filter loader options", () => {
    const options = {
      formatter: "table",
      ignore: false,
    };
    expect(getESLintOptions(options)).toStrictEqual({
      ignore: false,
    });
  });

  it("should keep the fix option", () => {
    // The fix option should be kept because it is common to both the loader and ESLint.
    const options = {
      eslintPath: "some/place/where/eslint/lives",
      formatter: "table",
      fix: true,
      emitError: false,
      emitWarning: false,
      failOnError: true,
      failOnWarning: true,
      quiet: false,
      outputReport: true,
    };
    expect(getESLintOptions(options)).toStrictEqual({
      fix: true,
    });
  });
});
