/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('./options').Options} Options */
/** @typedef {() => Promise<void>} AsyncTask */
/** @typedef {(files: string|string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {JestWorker & {lintFiles: LintTask}} Worker */
/** @typedef {{threads: number, ESLint: ESLint, eslint: ESLint, lintFiles: LintTask, cleanup: AsyncTask}} Linter */
/**
 * @param {Options} options
 * @returns {Linter}
 */
export function loadESLint(options: Options): Linter;
/**
 * @param {number} poolSize
 * @param {Options} options
 * @returns {Linter}
 */
export function loadESLintThreaded(poolSize: number, options: Options): Linter;
/**
 * @param {Options} options
 * @returns {Linter}
 */
export default function getESLint({ threads, ...options }: Options): Linter;
export type ESLint = import('eslint').ESLint;
export type LintResult = import('eslint').ESLint.LintResult;
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
export type AsyncTask = () => Promise<void>;
export type LintTask = (files: string | string[]) => Promise<LintResult[]>;
export type Worker = JestWorker & {
  lintFiles: LintTask;
};
export type Linter = {
  threads: number;
  ESLint: ESLint;
  eslint: ESLint;
  lintFiles: LintTask;
  cleanup: AsyncTask;
};
import JestWorker from 'jest-worker';
