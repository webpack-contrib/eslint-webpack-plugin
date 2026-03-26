export = linter;
/**
 * @param {Options} options options
 * @param {Compilation} compilation compilation
 * @returns {Promise<{ lint: Linter, report: Reporter }>} linter with additional functions
 */
declare function linter(
  options: Options,
  compilation: Compilation,
): Promise<{
  lint: Linter;
  report: Reporter;
}>;
declare namespace linter {
  export {
    ESLint,
    Formatter,
    LintResult,
    Compiler,
    Compilation,
    Options,
    FormatterFunction,
    GenerateReport,
    Report,
    Reporter,
    Linter,
    LintResultMap,
  };
}
type ESLint = import("eslint").ESLint;
type Formatter = import("eslint").ESLint.Formatter;
type LintResult = import("eslint").ESLint.LintResult;
type Compiler = import("webpack").Compiler;
type Compilation = import("webpack").Compilation;
type Options = import("./options").Options;
type FormatterFunction = import("./options").FormatterFunction;
type GenerateReport = (compilation: Compilation) => Promise<void>;
type Report = {
  errors?: ESLintError;
  warnings?: ESLintError;
  generateReportAsset?: GenerateReport;
};
type Reporter = () => Promise<Report>;
type Linter = (files: string | string[]) => void;
type LintResultMap = {
  [files: string]: LintResult;
};
import ESLintError = require("./ESLintError");
