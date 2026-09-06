declare namespace _exports {
  export {
    Formatter,
    FormatterType,
    LintResult,
    LinterOptions,
    LinterResult,
    RuleMeta,
    Compiler,
    FormatterOption,
    LinterContext,
    LinterInstance,
    Options,
    Stylelint,
    LintTask,
    Loaded,
    Worker,
    LintResultMap,
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
    let extensions: string[];
  }
  export { getLoadedStylelint };
  export { getStylelintOptions };
  export function defaultExclude(compiler: Compiler): string[];
  export { create };
}
export = _exports;
type Formatter = import("stylelint").Formatter;
type FormatterType = import("stylelint").FormatterType;
type LintResult = import("stylelint").LintResult;
type LinterOptions = import("stylelint").LinterOptions;
type LinterResult = import("stylelint").LinterResult;
type RuleMeta = import("stylelint").RuleMeta;
type Compiler = import("webpack").Compiler;
type FormatterOption = import("../linters").FormatterOption;
type LinterContext = import("../linters").LinterContext;
type LinterInstance = import("../linters").LinterInstance;
type Options = import("../options").LinterOptions;
type Stylelint = {
  lint: (options: LinterOptions) => Promise<LinterResult>;
  formatters: {
    [key: string]: Formatter;
  };
};
type LintTask = (files: string | string[]) => Promise<LintResult[]>;
type Loaded = {
  getStylelint: () => Promise<Stylelint>;
  lintFiles: LintTask;
  cleanup: () => Promise<void>;
  threads: number;
};
type Worker = JestWorker & {
  lintFiles: LintTask;
};
type LintResultMap = {
  [file: string]: LintResult;
};
declare const schema: {
  type: string;
  additionalProperties: boolean;
  properties: {
    stylelintPath: {
      description: string;
      type: string;
    };
    threads: {
      description: string;
      anyOf: {
        type: string;
      }[];
    };
  };
};
/**
 * Stylelint is loaded once per key and options, so a watch rebuild reuses the
 * worker pool the previous run started.
 * @param {string | undefined} key a cache key
 * @param {Options} options options
 * @returns {Loaded} loaded stylelint
 */
declare function getLoadedStylelint(
  key: string | undefined,
  options: Options,
): Loaded;
/**
 * @param {Options} options options
 * @returns {Partial<LinterOptions>} stylelint options
 */
declare function getStylelintOptions(options: Options): Partial<LinterOptions>;
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
