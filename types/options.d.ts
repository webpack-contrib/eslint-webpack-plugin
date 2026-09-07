export type EXPECTED_ANY = any;
export type FormatterOption = import("./linters/index.js").FormatterOption;
export type LinterAdapter = import("./linters/index.js").LinterAdapter;
export type LinterAdapterInput =
  import("./linters/index.js").LinterAdapterInput;
export type OutputReport = {
  /**
   * a file path
   */
  filePath?: string | undefined;
  /**
   * a formatter
   */
  formatter?: FormatterOption | undefined;
};
export type SharedOptions = {
  /**
   * enable the linter cache to decrease execution time
   */
  cache?: boolean | undefined;
  /**
   * specify the path to the cache location
   */
  cacheLocation?: string | undefined;
  /**
   * the errors found will always be emitted
   */
  emitError?: boolean | undefined;
  /**
   * the warnings found will always be emitted
   */
  emitWarning?: boolean | undefined;
  /**
   * specify the files and/or directories to exclude
   */
  exclude?: (string | string[]) | undefined;
  /**
   * specify the extensions that should be checked
   */
  extensions?: (string | string[]) | undefined;
  /**
   * will cause the module build to fail if there are any errors
   */
  failOnError?: boolean | undefined;
  /**
   * will cause the module build to fail if there are any warnings
   */
  failOnWarning?: boolean | undefined;
  /**
   * specify directories, files, or globs
   */
  files?: (string | string[]) | undefined;
  /**
   * apply fixes
   */
  fix?: boolean | undefined;
  /**
   * specify the formatter you would like to use to format your results
   */
  formatter?: FormatterOption | undefined;
  /**
   * writes the output of the errors to a file - for example, a `json` file for use for reporting
   */
  outputReport?: OutputReport | undefined;
  /**
   * will process and report errors only and ignore warnings
   */
  quiet?: boolean | undefined;
  /**
   * specify the resource query to exclude
   */
  resourceQueryExclude?: (RegExp | RegExp[] | string | string[]) | undefined;
};
export type LinterEntry = SharedOptions & {
  use: string | LinterAdapterInput;
  [option: string]: EXPECTED_ANY;
};
export type LinterOptions = SharedOptions & {
  [option: string]: EXPECTED_ANY;
};
export type PluginOptions = {
  /**
   * a string indicating the root of your files
   */
  context?: string | undefined;
  /**
   * lint only changed files, skip linting on start
   */
  lintDirtyModulesOnly?: boolean | undefined;
  /**
   * the linters to run
   */
  linters: LinterEntry[];
};
export type Options = SharedOptions & PluginOptions;
export type EnabledLinter = {
  /**
   * linter name
   */
  name: string;
  /**
   * linter adapter
   */
  adapter: LinterAdapter;
  /**
   * options resolved for this linter
   */
  options: LinterOptions;
};
export type NormalizedOptions = {
  /**
   * a string indicating the root of your files
   */
  context?: string | undefined;
  /**
   * lint only changed files, skip linting on start
   */
  lintDirtyModulesOnly?: boolean | undefined;
  /**
   * the linters to run
   */
  linters: EnabledLinter[];
};
/**
 * Splits the options shared by every linter from the per-linter entries and
 * merges each entry over them.
 * @param {Options} pluginOptions plugin options
 * @returns {NormalizedOptions} normalized plugin options
 */
export function getOptions(pluginOptions: Options): NormalizedOptions;
export namespace schema {
  let type: string;
  let additionalProperties: boolean;
  let properties: any;
  let required: string[];
}
