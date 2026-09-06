// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

const { validate } = require("schema-utils");

const linters = require("./linters");
const pluginSchema = require("./options.json");
const sharedSchema = require("./shared-options.json");

/** @typedef {import("./linters").FormatterOption} FormatterOption */
/** @typedef {import("./linters").LinterAdapter} LinterAdapter */

/**
 * @typedef {object} OutputReport
 * @property {string=} filePath a file path
 * @property {FormatterOption=} formatter a formatter
 */

/**
 * @typedef {object} SharedOptions
 * @property {boolean=} cache enable the linter cache to decrease execution time
 * @property {string=} cacheLocation specify the path to the cache location
 * @property {boolean=} emitError the errors found will always be emitted
 * @property {boolean=} emitWarning the warnings found will always be emitted
 * @property {string | string[]=} exclude specify the files and/or directories to exclude
 * @property {string | string[]=} extensions specify the extensions that should be checked
 * @property {boolean=} failOnError will cause the module build to fail if there are any errors
 * @property {boolean=} failOnWarning will cause the module build to fail if there are any warnings
 * @property {string | string[]=} files specify directories, files, or globs
 * @property {boolean=} fix apply fixes
 * @property {FormatterOption=} formatter specify the formatter you would like to use to format your results
 * @property {OutputReport=} outputReport writes the output of the errors to a file - for example, a `json` file for use for reporting
 * @property {boolean=} quiet will process and report errors only and ignore warnings
 * @property {RegExp | RegExp[] | string | string[]=} resourceQueryExclude specify the resource query to exclude
 */

/**
 * @typedef {SharedOptions & { configType?: string, eslintPath?: string, [option: string]: EXPECTED_ANY }} ESLintOptions
 */

/**
 * @typedef {SharedOptions & { stylelintPath?: string, threads?: number | boolean, [option: string]: EXPECTED_ANY }} StylelintOptions
 */

/**
 * @typedef {SharedOptions & { [option: string]: EXPECTED_ANY }} LinterOptions
 */

/**
 * @typedef {object} PluginOptions
 * @property {string=} context a string indicating the root of your files
 * @property {boolean=} lintDirtyModulesOnly lint only changed files, skip linting on start
 * @property {boolean | ESLintOptions=} eslint run ESLint, optionally with options of its own
 * @property {boolean | StylelintOptions=} stylelint run Stylelint, optionally with options of its own
 */

/** @typedef {SharedOptions & PluginOptions} Options */

/**
 * @typedef {object} EnabledLinter
 * @property {string} name linter name
 * @property {LinterAdapter} adapter linter adapter
 * @property {LinterOptions} options options resolved for this linter
 */

/**
 * @typedef {object} NormalizedOptions
 * @property {string=} context a string indicating the root of your files
 * @property {boolean=} lintDirtyModulesOnly lint only changed files, skip linting on start
 * @property {EnabledLinter[]} linters the linters to run
 */

const SHARED_DEFAULTS = {
  emitError: true,
  emitWarning: true,
};

/**
 * The plugin schema is composed at load time so that a linter added to the
 * registry brings its own options with it.
 * @returns {{ [key: string]: EXPECTED_ANY }} the schema of the plugin options
 */
function buildSchema() {
  /** @type {{ [key: string]: EXPECTED_ANY }} */
  const properties = {
    ...pluginSchema.properties,
    ...sharedSchema.properties,
  };

  for (const [name, adapter] of linters) {
    properties[name] = {
      description: `Run ${adapter.label}, set to \`true\` to run it with the default options.`,
      anyOf: [
        { type: "boolean" },
        {
          type: "object",
          additionalProperties: true,
          properties: {
            ...sharedSchema.properties,
            ...adapter.schema.properties,
          },
        },
      ],
    };
  }

  return {
    type: "object",
    additionalProperties: false,
    properties,
  };
}

const schema = buildSchema();

/**
 * Splits the options shared by every linter from the per-linter groups and
 * merges each group over them.
 * @param {Options} pluginOptions plugin options
 * @returns {NormalizedOptions} normalized plugin options
 */
function getOptions(pluginOptions) {
  validate(/** @type {EXPECTED_ANY} */ (schema), pluginOptions, {
    name: "Lint Webpack Plugin",
    baseDataPath: "options",
  });

  const { context, lintDirtyModulesOnly, ...rest } = pluginOptions;

  /** @type {LinterOptions} */
  const shared = {};

  for (const option of Object.keys(rest)) {
    if (linters.has(option)) continue;

    shared[option] = /** @type {EXPECTED_ANY} */ (rest)[option];
  }

  /** @type {EnabledLinter[]} */
  const enabled = [];

  for (const [name, adapter] of linters) {
    const value = /** @type {EXPECTED_ANY} */ (pluginOptions)[name];

    if (!value) continue;

    /** @type {LinterOptions} */
    const options = {
      ...SHARED_DEFAULTS,
      ...adapter.defaults,
      ...shared,
      ...(value === true ? {} : value),
    };

    if (options.quiet) {
      options.emitError = true;
      options.emitWarning = false;
    }

    enabled.push({ name, adapter, options });
  }

  if (enabled.length === 0) {
    throw new Error(
      `Lint Webpack Plugin: no linter enabled, set at least one of ${[
        ...linters.keys(),
      ]
        .map((name) => `\`${name}\``)
        .join(", ")} in the plugin options.`,
    );
  }

  return { context, lintDirtyModulesOnly, linters: enabled };
}

module.exports = {
  getOptions,
  schema,
};
