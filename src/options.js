import { createRequire } from "node:module";

// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

import { validate } from "schema-utils";

import linters from "./linters/index.js";

// JSON is read through CommonJS: import attributes are still ahead of the tooling
const schemaRequire = createRequire(import.meta.url);
const pluginSchema = schemaRequire("./options.json");
const sharedSchema = schemaRequire("./shared-options.json");

/** @typedef {import("./linters/index.js").FormatterOption} FormatterOption */
/** @typedef {import("./linters/index.js").LinterAdapter} LinterAdapter */
/** @typedef {import("./linters/index.js").LinterAdapterInput} LinterAdapterInput */

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
 * @typedef {SharedOptions & { use: string | LinterAdapterInput, [option: string]: EXPECTED_ANY }} LinterEntry
 */

/**
 * @typedef {SharedOptions & { [option: string]: EXPECTED_ANY }} LinterOptions
 */

/**
 * @typedef {object} PluginOptions
 * @property {string=} context a string indicating the root of your files
 * @property {boolean=} lintDirtyModulesOnly lint only changed files, skip linting on start
 * @property {LinterEntry[]} linters the linters to run
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
    linters: { ...pluginProperties.linters, items: entrySchema },
  },
  required: ["linters"],
};

/**
 * A `use` is either the name of a built-in linter or an adapter of its own, so
 * a linter can ship outside this package.
 * @param {string | LinterAdapterInput} use the linter to resolve
 * @returns {LinterAdapter} the adapter to run
 */
function toAdapter(use) {
  if (typeof use !== "string") {
    if (!use || typeof use.create !== "function" || !use.name) {
      throw new Error(
        "Lint Webpack Plugin: `use` needs the name of a built-in linter or a linter adapter with a `name` and a `create` function.",
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

  const adapter = linters.get(use);

  if (!adapter) {
    throw new Error(
      `Lint Webpack Plugin: unknown linter '${use}', expected one of ${[
        ...linters.keys(),
      ]
        .map((name) => `'${name}'`)
        .join(", ")} or a linter adapter.`,
    );
  }

  return adapter;
}

/**
 * Splits the options shared by every linter from the per-linter entries and
 * merges each entry over them.
 * @param {Options} pluginOptions plugin options
 * @returns {NormalizedOptions} normalized plugin options
 */
function getOptions(pluginOptions) {
  validate(/** @type {EXPECTED_ANY} */ (schema), pluginOptions, {
    name: "Lint Webpack Plugin",
    baseDataPath: "options",
  });

  const {
    context,
    lintDirtyModulesOnly,
    linters: entries,
    ...shared
  } = pluginOptions;

  const enabled = entries.map((entry, index) => {
    const { use, ...own } = entry;
    const adapter = toAdapter(use);

    validate(
      /** @type {EXPECTED_ANY} */ ({
        ...entrySchema,
        properties: { ...entrySchema.properties, ...adapter.schema.properties },
      }),
      entry,
      {
        name: `Lint Webpack Plugin (${adapter.label})`,
        baseDataPath: `options.linters[${index}]`,
      },
    );

    /** @type {LinterOptions} */
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

  return { context, lintDirtyModulesOnly, linters: enabled };
}

export { getOptions, schema };
