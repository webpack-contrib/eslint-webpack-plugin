export type ESLintClass = import("./eslint.js").ESLintClass;
export type ESLintOptions = import("./eslint.js").ESLintOptions;
export type LintResult = import("./eslint.js").LintResult;
export type ESLintInstance = InstanceType<ESLintClass>;
/**
 * @param {string[]} files the files to lint
 * @returns {Promise<LintResult[]>} what eslint found in them
 */
export function lintFiles(files: string[]): Promise<LintResult[]>;
/**
 * @param {string} path what names the eslint to load
 * @param {ESLintOptions} options the options it is constructed with
 * @param {boolean} flat whether it is loaded in flat mode
 * @returns {void}
 */
export function setup(
  path: string,
  options: ESLintOptions,
  flat: boolean,
): void;
