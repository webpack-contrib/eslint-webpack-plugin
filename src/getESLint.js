const { getESLintOptions } = require("./options");

/** @typedef {import("eslint").ESLint} ESLint */
/** @typedef {import("eslint").ESLint.LintResult} LintResult */
/** @typedef {import("./options").Options} Options */
/** @typedef {(files: string | string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {{ eslint: ESLint, lintFiles: LintTask }} Linter */
/** @typedef {import("eslint").ESLint.Options} ESLintOptions */
/** @typedef {{ new (arg0: ESLintOptions): ESLint, outputFixes: (arg0: LintResult[]) => Promise<void> }} ESLintClass */

/**
 * @param {Options} options options
 * @returns {Promise<Linter>} linter
 */
async function getESLint(options) {
  const eslintOptions = getESLintOptions(options);
  const fix = Boolean(eslintOptions && eslintOptions.fix);

  const eslintModule = require(options.eslintPath || "eslint");

  /** @type {ESLintClass} */
  const ESLint = await eslintModule.loadESLint({
    useFlatConfig: options.configType === "flat",
  });

  /** @type {ESLint} */
  const eslint = new ESLint(eslintOptions);

  /**
   * @param {string | string[]} files files
   * @returns {Promise<LintResult[]>} lint results
   */
  async function lintFiles(files) {
    /** @type {LintResult[]} */
    const result = await eslint.lintFiles(files);
    // if enabled, use eslint autofixing where possible
    if (fix) {
      await ESLint.outputFixes(result);
    }
    return result;
  }

  return {
    lintFiles,
    eslint,
  };
}

module.exports = {
  getESLint,
};
