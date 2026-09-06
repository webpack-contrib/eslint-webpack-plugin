declare namespace _exports {
  export {
    ESLint,
    Formatter,
    LintResult,
    ESLintOptions,
    FormatterOption,
    LinterContext,
    LinterInstance,
    Options,
    ESLintClass,
  };
}
declare namespace _exports {
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
export = _exports;
type ESLint = import("eslint").ESLint;
type Formatter = import("eslint").ESLint.Formatter;
type LintResult = import("eslint").ESLint.LintResult;
type ESLintOptions = import("eslint").ESLint.Options;
type FormatterOption = import("../linters").FormatterOption;
type LinterContext = import("../linters").LinterContext;
type LinterInstance = import("../linters").LinterInstance;
type Options = import("../options").LinterOptions;
type ESLintClass = {
  new (arg0: ESLintOptions): ESLint;
  outputFixes: (arg0: LintResult[]) => Promise<void>;
};
declare const schema: {
  type: string;
  additionalProperties: boolean;
  properties: {
    configType: {
      description: string;
      type: string;
    };
    eslintPath: {
      description: string;
      type: string;
    };
  };
};
/**
 * @param {LinterContext} context linter context
 * @returns {Promise<LinterInstance>} eslint linter
 */
declare function create({ options }: LinterContext): Promise<LinterInstance>;
/**
 * @param {Options} options plugin options
 * @returns {ESLintOptions} the options ESLint itself understands
 */
declare function getESLintOptions(options: Options): ESLintOptions;
