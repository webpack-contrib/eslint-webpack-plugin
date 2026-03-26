export type ESLint = import("eslint").ESLint;
export type LintResult = import("eslint").ESLint.LintResult;
export type Options = import("./options").Options;
export type LintTask = (files: string | string[]) => Promise<LintResult[]>;
export type Linter = {
  eslint: ESLint;
  lintFiles: LintTask;
};
export type ESLintOptions = import("eslint").ESLint.Options;
export type ESLintClass = {
  new (arg0: ESLintOptions): ESLint;
  outputFixes: (arg0: LintResult[]) => Promise<void>;
};
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
export function getESLint(options: Options): Promise<Linter>;
