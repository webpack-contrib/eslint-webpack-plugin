export type EXPECTED_ANY = any;
export type Compiler = import("webpack").Compiler;
export type ReportAs = "error" | "warning" | false;
export type FormatterOption = import("./checks/index.js").FormatterOption;
export type CheckAdapter = import("./checks/index.js").CheckAdapter;
export type CheckAdapterInput = import("./checks/index.js").CheckAdapterInput;
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
   * enable the tool's cache to decrease execution time
   */
  cache?: boolean | undefined;
  /**
   * specify the path to the cache location
   */
  cacheLocation?: string | undefined;
  /**
   * what a check reports its results as
   */
  reportAs?: ReportAs | undefined;
  /**
   * specify the files and/or directories to exclude
   */
  exclude?: (string | string[]) | undefined;
  /**
   * specify the extensions that should be checked
   */
  extensions?: (string | string[]) | undefined;
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
export type CheckEntry = SharedOptions & {
  use: string | CheckAdapterInput;
  [option: string]: EXPECTED_ANY;
};
/**
 * The options of one check, as given and then as the plugin resolves them
 * against a compiler.
 */
export type CheckOptions = SharedOptions & {
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
   * the checks to run
   */
  checks: CheckEntry[];
};
export type Options = SharedOptions & PluginOptions;
export type EnabledCheck = {
  /**
   * check name
   */
  name: string;
  /**
   * the adapter running it
   */
  adapter: CheckAdapter;
  /**
   * options resolved for this check
   */
  options: CheckOptions;
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
   * the checks to run
   */
  checks: EnabledCheck[];
};
/**
 * Splits the options shared by every check from the per-check entries and
 * merges each entry over them.
 * @param {Options} pluginOptions plugin options
 * @returns {NormalizedOptions} normalized plugin options
 */
export function getOptions(pluginOptions: Options): NormalizedOptions;
/**
 * Runs from `compiler.hooks.validate`, so webpack's own `validate: false`
 * turns it off the way it does for webpack's plugins.
 * @param {Compiler} compiler compiler
 * @param {Options} pluginOptions the options as they were given
 * @param {EnabledCheck[]} checks the checks resolved from them
 * @returns {void}
 */
export function validateOptions(
  compiler: Compiler,
  pluginOptions: Options,
  checks: EnabledCheck[],
): void;
