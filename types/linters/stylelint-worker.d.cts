export type EXPECTED_ANY = any;
export type LintResult = import("./stylelint.js").LintResult;
export type StylelintOptions = import("./stylelint.js").LinterOptions;
export type Stylelint = import("./stylelint.js").Stylelint;
export type Options = import("../options.js").LinterOptions;
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
export function setup(options: Options, stylelintOptions: Partial<StylelintOptions>): void;
