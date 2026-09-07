import { createRequire } from "node:module";

// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

import { validate } from "schema-utils";

import adapters from "./checks/index.js";

// JSON is read through CommonJS: import attributes are still ahead of the tooling
const schemaRequire = createRequire(import.meta.url);
const pluginSchema = schemaRequire("./options.json");
const sharedSchema = schemaRequire("./shared-options.json");

const PLUGIN_NAME = "Diagnostics Webpack Plugin";

/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("./checks/index.js").FormatterOption} FormatterOption */
/** @typedef {import("./checks/index.js").CheckAdapter} CheckAdapter */
/** @typedef {import("./checks/index.js").CheckAdapterInput} CheckAdapterInput */

/**
 * @typedef {object} OutputReport
 * @property {string=} filePath a file path
 * @property {FormatterOption=} formatter a formatter
 */

/**
 * @typedef {object} SharedOptions
 * @property {boolean=} cache enable the tool's cache to decrease execution time
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
 * @typedef {SharedOptions & { use: string | CheckAdapterInput, [option: string]: EXPECTED_ANY }} CheckEntry
 */

/**
 * @typedef {SharedOptions & { [option: string]: EXPECTED_ANY }} CheckOptions
 */

/**
 * @typedef {object} PluginOptions
 * @property {string=} context a string indicating the root of your files
 * @property {boolean=} lintDirtyModulesOnly lint only changed files, skip linting on start
 * @property {CheckEntry[]} checks the checks to run
 */

/** @typedef {SharedOptions & PluginOptions} Options */

/**
 * @typedef {object} EnabledCheck
 * @property {string} name check name
 * @property {CheckAdapter} adapter the adapter running it
 * @property {CheckOptions} options options resolved for this check
 */

/**
 * @typedef {object} NormalizedOptions
 * @property {string=} context a string indicating the root of your files
 * @property {boolean=} lintDirtyModulesOnly lint only changed files, skip linting on start
 * @property {EnabledCheck[]} checks the checks to run
 */

const SHARED_DEFAULTS = {
  emitError: true,
  emitWarning: true,
};

const DEFAULT_FOLDER_TO_EXCLUDE = "**/node_modules/**";

const { use: useProperty, ...pluginProperties } = pluginSchema.properties;

const entrySchema = {
  type: "object",
  additionalProperties: true,
  properties: { use: useProperty, ...sharedSchema.properties },
  required: ["use"],
};

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ...pluginProperties,
    ...sharedSchema.properties,
    checks: { ...pluginProperties.checks, items: entrySchema },
  },
  required: ["checks"],
};

/**
 * A `use` is either the name of a built-in check or an adapter of its own, so
 * a check can ship outside this package.
 * @param {string | CheckAdapterInput} use the check to resolve
 * @returns {CheckAdapter} the adapter to run
 */
function toAdapter(use) {
  if (typeof use !== "string") {
    if (!use || typeof use.create !== "function" || !use.name) {
      throw new Error(
        `${PLUGIN_NAME}: \`use\` needs the name of a built-in check or a check adapter with a \`name\` and a \`create\` function.`,
      );
    }

    return {
      label: use.name,
      filesSource: "modules",
      schema: { properties: {} },
      defaults: {},
      defaultExclude: () => DEFAULT_FOLDER_TO_EXCLUDE,
      ...use,
    };
  }

  const adapter = adapters.get(use);

  if (!adapter) {
    throw new Error(
      `${PLUGIN_NAME}: unknown check '${use}', expected one of ${[
        ...adapters.keys(),
      ]
        .map((name) => `'${name}'`)
        .join(", ")} or a check adapter.`,
    );
  }

  return adapter;
}

/**
 * Splits the options shared by every check from the per-check entries and
 * merges each entry over them.
 * @param {Options} pluginOptions plugin options
 * @returns {NormalizedOptions} normalized plugin options
 */
function getOptions(pluginOptions) {
  const {
    context,
    lintDirtyModulesOnly,
    checks: entries = [],
    ...shared
  } = pluginOptions;

  const enabled = entries.map((entry) => {
    const { use, ...own } = entry;
    const adapter = toAdapter(use);

    /** @type {CheckOptions} */
    const options = {
      ...SHARED_DEFAULTS,
      ...adapter.defaults,
      ...shared,
      ...own,
    };

    if (options.quiet) {
      options.emitError = true;
      options.emitWarning = false;
    }

    return { name: adapter.name, adapter, options };
  });

  return { context, lintDirtyModulesOnly, checks: enabled };
}

/**
 * Runs from `compiler.hooks.validate`, so webpack's own `validate: false`
 * turns it off the way it does for webpack's plugins.
 * @param {Compiler} compiler compiler
 * @param {Options} pluginOptions the options as they were given
 * @param {EnabledCheck[]} checks the checks resolved from them
 * @returns {void}
 */
function validateOptions(compiler, pluginOptions, checks) {
  // `compiler.validate` arrived with the hook, in webpack 5.106.
  const check = compiler.validate
    ? compiler.validate.bind(compiler)
    : /** @type {typeof compiler.validate} */ (
        (schemaToUse, value, options) =>
          validate(
            /** @type {EXPECTED_ANY} */ (schemaToUse),
            /** @type {EXPECTED_ANY} */ (value),
            options,
          )
      );

  check(/** @type {EXPECTED_ANY} */ (schema), pluginOptions, {
    name: PLUGIN_NAME,
    baseDataPath: "options",
  });

  for (const [index, entry] of (pluginOptions.checks || []).entries()) {
    const { adapter } = checks[index];

    check(
      /** @type {EXPECTED_ANY} */ ({
        ...entrySchema,
        properties: { ...entrySchema.properties, ...adapter.schema.properties },
      }),
      entry,
      {
        name: `${PLUGIN_NAME} (${adapter.label})`,
        baseDataPath: `options.checks[${index}]`,
      },
    );
  }
}

export { getOptions, schema, validateOptions };
