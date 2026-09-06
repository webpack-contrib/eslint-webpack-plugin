export = linter;
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
declare namespace linter {
  export {
    Compilation,
    LintResult,
    LinterInstance,
    EnabledLinter,
    OutputReportContent,
    Report,
    Runner,
  };
}
type Compilation = import("webpack").Compilation;
type LintResult = import("./linters").LintResult;
type LinterInstance = import("./linters").LinterInstance;
type EnabledLinter = import("./options").EnabledLinter;
type OutputReportContent = {
  filePath: string;
  content: string;
};
type Report = {
  errors?: LintError;
  warnings?: LintError;
  outputReport?: OutputReportContent;
};
type Runner = {
  lint: (files: string[]) => void;
  report: () => Promise<Report>;
};
import LintError = require("./LintError");
