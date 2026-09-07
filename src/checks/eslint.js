import { createRequire } from "node:module";

import { importFrom, omitPluginOptions } from "../utils.js";

// JSON is read through CommonJS: import attributes are still ahead of the tooling
const schemaRequire = createRequire(import.meta.url);
const pluginSchema = schemaRequire("../options.json");
const sharedSchema = schemaRequire("../shared-options.json");
const schema = schemaRequire("./eslint.json");

/** @typedef {import("eslint").ESLint} ESLint */
/** @typedef {import("eslint").ESLint.Formatter} Formatter */
/** @typedef {import("eslint").ESLint.LintResult} LintResult */
/** @typedef {import("eslint").ESLint.Options} ESLintOptions */
/** @typedef {import("../checks/index.js").FormatterOption} FormatterOption */
/** @typedef {import("../checks/index.js").CheckContext} CheckContext */
/** @typedef {import("../checks/index.js").CheckInstance} CheckInstance */
/** @typedef {import("../options.js").CheckOptions} Options */
/** @typedef {{ new (arg0: ESLintOptions): ESLint, outputFixes: (arg0: LintResult[]) => Promise<void> }} ESLintClass */

// `fix` and `extensions` are meaningful to ESLint itself, the rest of the
// plugin schema is not.
const KEPT_OPTIONS = ["cache", "cacheLocation", "extensions", "fix"];

/**
 * @param {ESLint} eslint eslint
 * @param {LintResult[]} results results
 * @returns {Promise<LintResult[]>} results without the warnings of ignored files
 */
async function removeIgnoredWarnings(eslint, results) {
  const filterPromises = results.map(async (result) => {
    // Short circuit the call to isPathIgnored.
    //   fatal is false for ignored file warnings.
    //   ruleId is unset for internal ESLint errors.
    //   line is unset for warnings not involving file contents.
    const { messages, warningCount, errorCount, filePath } = result;
    const [firstMessage] = messages;
    const hasWarning = warningCount === 1 && errorCount === 0;
    const ignored =
      messages.length === 0 ||
      (hasWarning &&
        !firstMessage.fatal &&
        !firstMessage.ruleId &&
        !firstMessage.line &&
        (await eslint.isPathIgnored(filePath)));
    return ignored ? false : result;
  });

  return /** @type {LintResult[]} */ (
    (await Promise.all(filterPromises)).filter((result) => result !== false)
  );
}

/**
 * @param {ESLint} eslint eslint
 * @param {FormatterOption=} formatter formatter
 * @returns {Promise<Formatter>} loaded formatter
 */
async function loadFormatter(eslint, formatter) {
  if (typeof formatter === "function") {
    return { format: /** @type {Formatter["format"]} */ (formatter) };
  }

  if (typeof formatter === "string") {
    try {
      return await eslint.loadFormatter(formatter);
    } catch {
      // Load the default formatter.
    }
  }

  return eslint.loadFormatter();
}

/**
 * @param {Options} options plugin options
 * @returns {ESLintOptions} the options ESLint itself understands
 */
function getESLintOptions(options) {
  const eslintOptions = /** @type {ESLintOptions} */ (
    omitPluginOptions(
      options,
      {
        ...pluginSchema.properties,
        ...sharedSchema.properties,
        ...schema.properties,
      },
      KEPT_OPTIONS,
    )
  );

  // Some options aren't available in flat mode.
  if (options.configType === "flat") {
    delete (
      /** @type {{ extensions?: string[] }} */ (eslintOptions).extensions
    );
  }

  return eslintOptions;
}

/**
 * @param {CheckContext} context check context
 * @returns {Promise<CheckInstance>} eslint check
 */
async function create({ options }) {
  const eslintOptions = getESLintOptions(options);
  const fix = Boolean(eslintOptions.fix);

  const eslintModule = await importFrom(options.eslintPath || "eslint");

  /** @type {ESLintClass} */
  const ESLint = await eslintModule.loadESLint({
    useFlatConfig: options.configType === "flat",
  });

  const eslint = new ESLint(eslintOptions);

  return {
    async lintFiles(files) {
      const results = await eslint.lintFiles(files);

      // If enabled, use the ESLint autofixing where possible.
      if (fix) {
        await ESLint.outputFixes(results);
      }

      return results;
    },
    getResults: (results) =>
      removeIgnoredWarnings(eslint, /** @type {LintResult[]} */ (results)),
    splitResults(results) {
      /** @type {LintResult[]} */
      const errors = [];
      /** @type {LintResult[]} */
      const warnings = [];

      for (const file of /** @type {LintResult[]} */ (results)) {
        if (file.errorCount > 0) {
          const messages = file.messages.filter(
            (message) => options.emitError && message.severity === 2,
          );

          if (messages.length > 0) {
            errors.push({ ...file, messages });
          }
        }

        if (file.warningCount > 0) {
          const messages = file.messages.filter(
            (message) => options.emitWarning && message.severity === 1,
          );

          if (messages.length > 0) {
            warnings.push({ ...file, messages });
          }
        }
      }

      return { errors, warnings };
    },
    async getFormatter(formatter) {
      const loaded = await loadFormatter(eslint, formatter);

      return async (results) =>
        loaded.format(/** @type {LintResult[]} */ (results));
    },
    async cleanup() {},
  };
}

export { getESLintOptions };

export default {
  name: "eslint",
  label: "ESLint",
  filesSource: "modules",
  schema,
  defaults: {
    cache: true,
    cacheLocation:
      "node_modules/.cache/diagnostics-webpack-plugin/.eslintcache",
    configType: "flat",
    extensions: "js",
  },
  defaultExclude: () => "**/node_modules/**",
  create,
  getESLintOptions,
};
