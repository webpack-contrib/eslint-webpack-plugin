export type LintResult = import("./stylelint").LintResult;
export type StylelintOptions = import("./stylelint").LinterOptions;
export type Stylelint = import("./stylelint").Stylelint;
export type Options = import("../options").LinterOptions;
/**
 * Lazily load stylelint on first use.
 * @returns {Promise<Stylelint>} stylelint instance
 */
export function getStylelint(): Promise<Stylelint>;
/**
 * @param {string | string[]} files files
 * @returns {Promise<LintResult[]>} results
 */
export function lintFiles(files: string | string[]): Promise<LintResult[]>;
/**
 * @param {Options} options the worker options
 * @param {Partial<StylelintOptions>} stylelintOptions the stylelint options
 */
export function setup(
  options: Options,
  stylelintOptions: Partial<StylelintOptions>,
): void;
