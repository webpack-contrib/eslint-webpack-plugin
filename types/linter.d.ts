export default linter;
export type Compilation = import("webpack").Compilation;
export type LintResult = import("./linters/index.js").LintResult;
export type LinterInstance = import("./linters/index.js").LinterInstance;
export type EnabledLinter = import("./options.js").EnabledLinter;
export type OutputReportContent = {
  filePath: string;
  content: string;
};
export type Report = {
  errors?: LintError;
  warnings?: LintError;
  outputReport?: OutputReportContent;
};
export type Runner = {
  lint: (files: string[]) => void;
  report: () => Promise<Report>;
};
/**
 * Creates the linter synchronously so that the compilation hooks are tapped
 * before webpack starts building modules, whatever the linter takes to load.
 * @param {string} key a key unique to the compiler the linter runs for
 * @param {EnabledLinter} linter the linter to run
 * @param {Compilation} compilation compilation
 * @returns {Runner} the runner collecting and reporting the results
 */
declare function linter(
  key: string,
  { name, adapter, options }: EnabledLinter,
  compilation: Compilation,
): Runner;
import LintError from "./LintError.js";
