import { isAbsolute, join } from "node:path";

import DiagnosticError from "./DiagnosticError.js";

/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("./checks/index.js").CheckResult} CheckResult */
/** @typedef {import("./checks/index.js").CheckInstance} CheckInstance */
/** @typedef {import("./options.js").EnabledCheck} EnabledCheck */
/** @typedef {{ filePath: string, content: string }} OutputReportContent */
/** @typedef {{ errors?: DiagnosticError, warnings?: DiagnosticError, outputReport?: OutputReportContent }} Report */
/** @typedef {{ lint: (files: string[]) => void, report: () => Promise<Report> }} Runner */

/**
 * @param {Promise<CheckResult[]>[]} results results
 * @returns {Promise<CheckResult[]>} flattened results
 */
async function flatten(results) {
  /**
   * @param {CheckResult[]} acc acc
   * @param {CheckResult[]} list list
   * @returns {CheckResult[]} result
   */
  const flat = (acc, list) => [...acc, ...list];
  return (await Promise.all(results)).reduce(flat, []);
}

/**
 * Creates the check synchronously so that the compilation hooks are tapped
 * before webpack starts building modules, whatever the tool takes to load.
 * @param {string} key a key unique to the compiler the check runs for
 * @param {EnabledCheck} check the check to run
 * @param {Compilation} compilation compilation
 * @returns {Runner} the runner collecting and reporting the results
 */
function createCheckRunner(key, { name, adapter, options }, compilation) {
  /** @type {Promise<CheckInstance | null>} */
  const pending = adapter.create({ key, options, compilation }).catch((err) => {
    compilation.errors.push(new DiagnosticError(name, err.message));
    return null;
  });

  /** @type {Promise<CheckResult[]>[]} */
  const rawResults = [];

  /**
   * @param {string[]} files files
   */
  function lint(files) {
    rawResults.push(
      pending
        .then((instance) => (instance ? instance.lintFiles(files) : []))
        .catch((err) => {
          compilation.errors.push(new DiagnosticError(name, err.message));
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

    // Do not analyze when the check reported nothing.
    if (!results || results.length === 0) {
      return {};
    }

    const format = await instance.getFormatter(options.formatter);
    const { errors, warnings } = instance.splitResults(results);

    /** @type {Report} */
    const report = {};

    // `quiet` drops the warnings and `reportAs: false` everything, but an
    // `outputReport` is still written from all of the results below.
    if (options.reportAs !== false) {
      if (warnings.length > 0 && !options.quiet) {
        report.warnings = new DiagnosticError(name, await format(warnings));
      }

      if (errors.length > 0) {
        report.errors = new DiagnosticError(name, await format(errors));
      }
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

export default createCheckRunner;
