const { validate } = require("schema-utils");

const schema = require("./options.json");

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
function getOptions(pluginOptions) {
  const options = {
    cache: true,
    cacheLocation: "node_modules/.cache/eslint-webpack-plugin/.eslintcache",
    configType: "flat",
    extensions: "js",
    emitError: true,
    emitWarning: true,
    resourceQueryExclude: [],
    ...pluginOptions,
    ...(pluginOptions.quiet ? { emitError: true, emitWarning: false } : {}),
  };

  // @ts-expect-error need better types
  validate(schema, options, {
    name: "ESLint Webpack Plugin",
    baseDataPath: "options",
  });

  return options;
}

/**
 * @param {Options} loaderOptions loader options
 * @returns {ESLintOptions} eslint options
 */
function getESLintOptions(loaderOptions) {
  const eslintOptions = { ...loaderOptions };

  // Keep the fix option because it is common to both the loader and ESLint.
  const { fix, extensions, ...eslintOnlyOptions } = schema.properties;

  // No need to guard the for-in because schema.properties has hardcoded keys.

  for (const option in eslintOnlyOptions) {
    // @ts-expect-error need better types
    delete eslintOptions[option];
  }

  // Some options aren't available in flat mode
  if (loaderOptions.configType === "flat") {
    delete eslintOptions.extensions;
  }

  return eslintOptions;
}

module.exports = {
  getESLintOptions,
  getOptions,
};
