import { isAbsolute, join } from "node:path";

import LintError from "./LintError.js";

/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("./linters/index.js").LintResult} LintResult */
/** @typedef {import("./linters/index.js").LinterInstance} LinterInstance */
/** @typedef {import("./options.js").EnabledLinter} EnabledLinter */
/** @typedef {{ filePath: string, content: string }} OutputReportContent */
/** @typedef {{ errors?: LintError, warnings?: LintError, outputReport?: OutputReportContent }} Report */
/** @typedef {{ lint: (files: string[]) => void, report: () => Promise<Report> }} Runner */

/**
 * @param {Promise<LintResult[]>[]} results results
 * @returns {Promise<LintResult[]>} flattened results
 */
async function flatten(results) {
  /**
   * @param {LintResult[]} acc acc
   * @param {LintResult[]} list list
   * @returns {LintResult[]} result
   */
  const flat = (acc, list) => [...acc, ...list];
  return (await Promise.all(results)).reduce(flat, []);
}

/**
 * Creates the linter synchronously so that the compilation hooks are tapped
 * before webpack starts building modules, whatever the linter takes to load.
 * @param {string} key a key unique to the compiler the linter runs for
 * @param {EnabledLinter} linter the linter to run
 * @param {Compilation} compilation compilation
 * @returns {Runner} the runner collecting and reporting the results
 */
function linter(key, { name, adapter, options }, compilation) {
  /** @type {Promise<LinterInstance | null>} */
  const pending = adapter.create({ key, options, compilation }).catch((err) => {
    compilation.errors.push(new LintError(name, err.message));
    return null;
  });

  /** @type {Promise<LintResult[]>[]} */
  const rawResults = [];

  /**
   * @param {string[]} files files
   */
  function lint(files) {
    rawResults.push(
      pending
        .then((instance) => (instance ? instance.lintFiles(files) : []))
        .catch((err) => {
          compilation.errors.push(new LintError(name, err.message));
          return [];
        }),
    );
  }

  /**
   * @returns {Promise<Report>} report
   */
  async function report() {
    const instance = await pending;

    if (!instance) return {};

    // Get the current results, resetting the raw results to empty.
    const raw = await flatten(rawResults.splice(0));

    await instance.cleanup();

    const results = await instance.getResults(raw);

    // Do not analyze when the linter reported nothing.
    if (!results || results.length === 0) {
      return {};
    }

    const format = await instance.getFormatter(options.formatter);
    const { errors, warnings } = instance.splitResults(results);

    /** @type {Report} */
    const report = {};

    if (warnings.length > 0) {
      report.warnings = new LintError(name, await format(warnings));
    }

    if (errors.length > 0) {
      report.errors = new LintError(name, await format(errors));
    }

    const { outputReport } = options;

    if (outputReport && outputReport.filePath) {
      const content = await (outputReport.formatter
        ? (await instance.getFormatter(outputReport.formatter))(results)
        : format(results));

      report.outputReport = {
        filePath: isAbsolute(outputReport.filePath)
          ? outputReport.filePath
          : join(compilation.compiler.outputPath, outputReport.filePath),
        content,
      };
    }

    return report;
  }

  return { lint, report };
}

export default linter;
