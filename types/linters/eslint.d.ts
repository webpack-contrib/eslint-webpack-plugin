declare namespace _default {
  export let name: string;
  export let label: string;
  export let filesSource: string;
  export { schema };
  export namespace defaults {
    let cache: boolean;
    let cacheLocation: string;
    let configType: string;
    let extensions: string;
  }
  export function defaultExclude(): string;
  export { create };
  export { getESLintOptions };
}
export default _default;
export type ESLint = import("eslint").ESLint;
export type Formatter = import("eslint").ESLint.Formatter;
export type LintResult = import("eslint").ESLint.LintResult;
export type ESLintOptions = import("eslint").ESLint.Options;
export type FormatterOption = import("../linters/index.js").FormatterOption;
export type LinterContext = import("../linters/index.js").LinterContext;
export type LinterInstance = import("../linters/index.js").LinterInstance;
export type Options = import("../options.js").LinterOptions;
export type ESLintClass = {
  new (arg0: ESLintOptions): ESLint;
  outputFixes: (arg0: LintResult[]) => Promise<void>;
};
/**
 * @param {Options} options plugin options
 * @returns {ESLintOptions} the options ESLint itself understands
 */
export function getESLintOptions(options: Options): ESLintOptions;
declare const schema: any;
/**
 * @param {LinterContext} context linter context
 * @returns {Promise<LinterInstance>} eslint linter
 */
declare function create({ options }: LinterContext): Promise<LinterInstance>;
