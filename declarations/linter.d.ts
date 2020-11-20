/**
 * @param {Options} options
 * @param {Compilation} compilation
 * @returns {{lint: Linter, report: Reporter}}
 */
export default function linter(
  options: Options,
  compilation: Compilation
): {
  lint: Linter;
  report: Reporter;
};
export type ESLint = import('eslint').ESLint;
export type Formatter = import('eslint').ESLint.Formatter;
export type LintResult = import('eslint').ESLint.LintResult;
export type Compiler = import('webpack').Compiler;
export type Compilation = import('webpack').Compilation;
export type Source = import('webpack-sources/lib/Source');
export type Options = {
  context?: string | undefined;
  emitError?: boolean | undefined;
  emitWarning?: boolean | undefined;
  eslintPath?: string | undefined;
  exclude?: string | string[] | undefined;
  extensions?: string | string[] | undefined;
  failOnError?: boolean | undefined;
  failOnWarning?: boolean | undefined;
  files?: string | string[] | undefined;
  fix?: boolean | undefined;
  formatter?: string | import('./options').FormatterFunction | undefined;
  lintDirtyModulesOnly?: boolean | undefined;
  quiet?: boolean | undefined;
  outputReport?: import('./options').OutputReport | undefined;
  threads?: number | boolean | undefined;
};
export type FormatterFunction = (
  results: import('eslint').ESLint.LintResult[],
  data?: import('eslint').ESLint.LintResultData | undefined
) => string;
export type GenerateReport = (compilation: Compilation) => Promise<void>;
export type Report = {
  errors?: ESLintError | undefined;
  warnings?: ESLintError | undefined;
  generateReportAsset?:
    | ((compilation: Compilation) => Promise<void>)
    | undefined;
};
export type Reporter = () => Promise<Report>;
export type Linter = (files: string | string[]) => void;
export type LintResultMap = {
  [files: string]: import('eslint').ESLint.LintResult;
};
import ESLintError from './ESLintError';
