export type ESLintOptions = import('eslint').ESLint.Options;
export type LintResult = import('eslint').ESLint.LintResult;
export type FormatterFunction = (results: LintResult[]) => string;
export type OutputReport = {
  filePath?: string | undefined;
  formatter?: (string | FormatterFunction) | undefined;
};
export type PluginOptions = {
  context?: string | undefined;
  emitError?: boolean | undefined;
  emitWarning?: boolean | undefined;
  eslintPath?: string | undefined;
  exclude?: (string | string[]) | undefined;
  extensions?: (string | string[]) | undefined;
  failOnError?: boolean | undefined;
  failOnWarning?: boolean | undefined;
  files?: (string | string[]) | undefined;
  fix?: boolean | undefined;
  formatter?: (string | FormatterFunction) | undefined;
  lintDirtyModulesOnly?: boolean | undefined;
  quiet?: boolean | undefined;
  outputReport?: OutputReport | undefined;
  threads?: (number | boolean) | undefined;
  resourceQueryExclude?: (RegExp | RegExp[]) | undefined;
  configType?: string | undefined;
};
export type Options = PluginOptions & ESLintOptions;
/** @typedef {import("eslint").ESLint.Options} ESLintOptions */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/**
 * @callback FormatterFunction
 * @param {LintResult[]} results
 * @returns {string}
 */
/**
 * @typedef {Object} OutputReport
 * @property {string=} filePath
 * @property {string|FormatterFunction=} formatter
 */
/**
 * @typedef {Object} PluginOptions
 * @property {string=} context
 * @property {boolean=} emitError
 * @property {boolean=} emitWarning
 * @property {string=} eslintPath
 * @property {string|string[]=} exclude
 * @property {string|string[]=} extensions
 * @property {boolean=} failOnError
 * @property {boolean=} failOnWarning
 * @property {string|string[]=} files
 * @property {boolean=} fix
 * @property {string|FormatterFunction=} formatter
 * @property {boolean=} lintDirtyModulesOnly
 * @property {boolean=} quiet
 * @property {OutputReport=} outputReport
 * @property {number|boolean=} threads
 * @property {RegExp|RegExp[]=} resourceQueryExclude
 * @property {string=} configType
 */
/** @typedef {PluginOptions & ESLintOptions} Options */
/**
 * @param {Options} pluginOptions
 * @returns {PluginOptions}
 */
export function getOptions(pluginOptions: Options): PluginOptions;
/**
 * @param {Options} loaderOptions
 * @returns {ESLintOptions}
 */
export function getESLintOptions(loaderOptions: Options): ESLintOptions;
