declare namespace _default {
  export let name: string;
  export let label: string;
  export let filesSource: string;
  export { schema };
  export namespace defaults {
    let cache: boolean;
    let cacheLocation: string;
    let extensions: string[];
  }
  export { getLoadedStylelint };
  export { getStylelintOptions };
  export function defaultExclude(compiler: Compiler): string[];
  export { create };
}
export default _default;
export type Formatter = import("stylelint").Formatter;
export type FormatterType = import("stylelint").FormatterType;
export type LintResult = import("stylelint").LintResult;
export type LinterOptions = import("stylelint").LinterOptions;
export type LinterResult = import("stylelint").LinterResult;
export type RuleMeta = import("stylelint").RuleMeta;
export type Compiler = import("webpack").Compiler;
export type FormatterOption = import("../linters/index.js").FormatterOption;
export type LinterContext = import("../linters/index.js").LinterContext;
export type LinterInstance = import("../linters/index.js").LinterInstance;
export type Options = import("../options.js").LinterOptions;
export type Stylelint = {
  lint: (options: LinterOptions) => Promise<LinterResult>;
  formatters: {
    [key: string]: Formatter;
  };
};
export type LintTask = (files: string | string[]) => Promise<LintResult[]>;
export type Loaded = {
  getStylelint: () => Promise<Stylelint>;
  lintFiles: LintTask;
  cleanup: () => Promise<void>;
  threads: number;
};
export type Worker = JestWorker & {
  lintFiles: LintTask;
};
export type LintResultMap = {
  [file: string]: LintResult;
};
/**
 * Stylelint is loaded once per key and options, so a watch rebuild reuses the
 * worker pool the previous run started.
 * @param {string | undefined} key a cache key
 * @param {Options} options options
 * @returns {Loaded} loaded stylelint
 */
export function getLoadedStylelint(
  key: string | undefined,
  options: Options,
): Loaded;
/**
 * @param {Options} options options
 * @returns {Partial<LinterOptions>} stylelint options
 */
export function getStylelintOptions(options: Options): Partial<LinterOptions>;
declare const schema: any;
/**
 * @param {LinterContext} context linter context
 * @returns {Promise<LinterInstance>} stylelint linter
 */
declare function create({
  key,
  options,
  compilation,
}: LinterContext): Promise<LinterInstance>;
import { Worker as JestWorker } from "jest-worker";
