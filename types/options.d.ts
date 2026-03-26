export type ESLintOptions = import("eslint").ESLint.Options;
export type LintResult = import("eslint").ESLint.LintResult;
export type FormatterFunction = (results: LintResult[]) => string;
export type OutputReport = {
  /**
   * a file path
   */
  filePath?: string | undefined;
  /**
   * a formatter
   */
  formatter?: (string | FormatterFunction) | undefined;
};
export type PluginOptions = {
  /**
   * a string indicating the root of your files
   */
  context?: string | undefined;
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
   * will cause the module build to fail if there are any warning
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
  formatter?: (string | FormatterFunction) | undefined;
  /**
   * lint only changed files, skip linting on start
   */
  lintDirtyModulesOnly?: boolean | undefined;
  /**
   * will process and report errors only and ignore warnings
   */
  quiet?: boolean | undefined;
  /**
   * path to `eslint` instance that will be used for linting
   */
  eslintPath?: string | undefined;
  /**
   * writes the output of the errors to a file - for example, a `json` file for use for reporting
   */
  outputReport?: OutputReport | undefined;
  /**
   * Specify the resource query to exclude
   */
  resourceQueryExclude?: (RegExp | RegExp[]) | undefined;
  /**
   * config type
   */
  configType?: string | undefined;
};
export type Options = PluginOptions & ESLintOptions;
/**
 * @param {Options} loaderOptions loader options
 * @returns {ESLintOptions} eslint options
 */
export function getESLintOptions(loaderOptions: Options): ESLintOptions;
/** @typedef {import("eslint").ESLint.Options} ESLintOptions */
/** @typedef {import("eslint").ESLint.LintResult} LintResult */
/**
 * @callback FormatterFunction
 * @param {LintResult[]} results results
 * @returns {string} formatted result
 */
/**
 * @typedef {object} OutputReport
 * @property {string=} filePath a file path
 * @property {string | FormatterFunction=} formatter a formatter
 */
/**
 * @typedef {object} PluginOptions
 * @property {string=} context a string indicating the root of your files
 * @property {boolean=} emitError the errors found will always be emitted
 * @property {boolean=} emitWarning the warnings found will always be emitted
 * @property {string | string[]=} exclude specify the files and/or directories to exclude
 * @property {string | string[]=} extensions specify the extensions that should be checked
 * @property {boolean=} failOnError will cause the module build to fail if there are any errors
 * @property {boolean=} failOnWarning will cause the module build to fail if there are any warning
 * @property {string | string[]=} files specify directories, files, or globs
 * @property {boolean=} fix apply fixes
 * @property {string | FormatterFunction=} formatter specify the formatter you would like to use to format your results
 * @property {boolean=} lintDirtyModulesOnly lint only changed files, skip linting on start
 * @property {boolean=} quiet will process and report errors only and ignore warnings
 * @property {string=} eslintPath path to `eslint` instance that will be used for linting
 * @property {OutputReport=} outputReport writes the output of the errors to a file - for example, a `json` file for use for reporting
 * @property {RegExp | RegExp[]=} resourceQueryExclude Specify the resource query to exclude
 * @property {string=} configType config type
 */
/** @typedef {PluginOptions & ESLintOptions} Options */
/**
 * @param {Options} pluginOptions plugin options
 * @returns {PluginOptions} normalized plugin options
 */
export function getOptions(pluginOptions: Options): PluginOptions;
