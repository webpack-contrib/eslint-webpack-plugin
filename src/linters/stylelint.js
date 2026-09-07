import { createRequire } from "node:module";
import { cpus } from "node:os";

import { Worker as JestWorker } from "jest-worker";

import {
  jsonStringifyReplacerSortKeys,
  omitPluginOptions,
  parseFiles,
} from "../utils.js";

// JSON is read through CommonJS: import attributes are still ahead of the tooling
const nodeRequire = createRequire(import.meta.url);
const pluginSchema = nodeRequire("../options.json");
const sharedSchema = nodeRequire("../shared-options.json");
const schema = nodeRequire("./stylelint.json");

// The worker entry stays CommonJS so every runner can load it in a worker thread
const {
  getStylelint: getStylelintInstance,
  lintFiles,
  setup,
} = nodeRequire("./stylelint-worker.cjs");

/** @typedef {import("stylelint").Formatter} Formatter */
/** @typedef {import("stylelint").FormatterType} FormatterType */
/** @typedef {import("stylelint").LintResult} LintResult */
/** @typedef {import("stylelint").LinterOptions} LinterOptions */
/** @typedef {import("stylelint").LinterResult} LinterResult */
/** @typedef {import("stylelint").RuleMeta} RuleMeta */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("../linters/index.js").FormatterOption} FormatterOption */
/** @typedef {import("../linters/index.js").LinterContext} LinterContext */
/** @typedef {import("../linters/index.js").LinterInstance} LinterInstance */
/** @typedef {import("../options.js").LinterOptions} Options */
/** @typedef {{ lint: (options: LinterOptions) => Promise<LinterResult>, formatters: { [key: string]: Formatter } }} Stylelint */
/** @typedef {(files: string | string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {{ getStylelint: () => Promise<Stylelint>, lintFiles: LintTask, cleanup: () => Promise<void>, threads: number }} Loaded */
/** @typedef {JestWorker & { lintFiles: LintTask }} Worker */
/** @typedef {{ [file: string]: LintResult }} LintResultMap */

// `files`, `formatter` and `fix` are meaningful to Stylelint itself, the rest
// of the plugin schema is not.
const KEPT_OPTIONS = ["cache", "cacheLocation", "files", "fix", "formatter"];

/** @type {{ [key: string]: Loaded }} */
const cache = {};

/** @type {WeakMap<Compiler, LintResultMap>} */
const resultStorage = new WeakMap();

/**
 * Stylelint only lints the files webpack reports as modified, so results of
 * files left untouched by a watch rebuild are carried over from the last run.
 * @param {Compiler} compiler compiler
 * @returns {LintResultMap} lint result map
 */
function getResultStorage(compiler) {
  let storage = resultStorage.get(compiler);

  if (!storage) {
    storage = {};
    resultStorage.set(compiler, storage);
  }

  return storage;
}

/**
 * @param {Options} options options
 * @returns {Partial<LinterOptions>} stylelint options
 */
function getStylelintOptions(options) {
  return /** @type {Partial<LinterOptions>} */ (
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
}

/**
 * @param {Options} options options
 * @returns {Loaded} loaded stylelint
 */
function loadStylelint(options) {
  setup(options, getStylelintOptions(options));

  return {
    getStylelint: getStylelintInstance,
    lintFiles,
    cleanup: async () => {},
    threads: 1,
  };
}

/**
 * @param {string} cacheKey the key the loaded stylelint is cached under
 * @param {number} poolSize number of workers
 * @param {Options} options options
 * @returns {Loaded} loaded stylelint
 */
function loadStylelintThreaded(cacheKey, poolSize, options) {
  const source = nodeRequire.resolve("./stylelint-worker.cjs");
  const local = loadStylelint(options);

  let worker = /** @type {Worker | null} */ (
    new JestWorker(source, {
      enableWorkerThreads: true,
      numWorkers: poolSize,
      setupArgs: [options, getStylelintOptions(options)],
    })
  );

  /** @type {Loaded} */
  const context = {
    ...local,
    threads: poolSize,
    lintFiles: async (files) =>
      /* istanbul ignore next */
      worker ? worker.lintFiles(files) : local.lintFiles(files),
    cleanup: async () => {
      cache[cacheKey] = local;
      context.lintFiles = (files) => local.lintFiles(files);
      /* istanbul ignore next */
      if (worker) {
        worker.end();
        worker = null;
      }
    },
  };

  return context;
}

/**
 * @param {string | undefined} key a cache key
 * @param {Options} options options
 * @returns {string} a stringified cache key
 */
function getCacheKey(key, options) {
  return JSON.stringify({ key, options }, jsonStringifyReplacerSortKeys);
}

/* istanbul ignore next */
/**
 * @param {LintResult[]} results lint results
 * @returns {{ [ruleName: string]: Partial<RuleMeta> }} a rule meta
 */
function getRuleMetadata(results) {
  const [result] = results;

  if (result === undefined) return {};
  if (result._postcssResult === undefined) return {};

  return result._postcssResult.stylelint.ruleMetadata;
}

/**
 * @param {Stylelint} stylelint stylelint
 * @param {FormatterOption=} formatter formatter
 * @returns {Promise<Formatter>} loaded formatter
 */
async function loadFormatter(stylelint, formatter) {
  if (typeof formatter === "function") {
    return /** @type {Formatter} */ (formatter);
  }

  if (typeof formatter === "string") {
    try {
      return await stylelint.formatters[formatter];
    } catch {
      // Load the default formatter.
    }
  }

  return stylelint.formatters.string;
}

/**
 * Stylelint is loaded once per key and options, so a watch rebuild reuses the
 * worker pool the previous run started.
 * @param {string | undefined} key a cache key
 * @param {Options} options options
 * @returns {Loaded} loaded stylelint
 */
function getLoadedStylelint(key, options) {
  const cacheKey = getCacheKey(key, options);
  const { threads } = options;
  const poolSize =
    typeof threads === "number" ? threads : threads ? cpus().length - 1 : 1;

  if (!cache[cacheKey]) {
    cache[cacheKey] =
      poolSize > 1
        ? loadStylelintThreaded(cacheKey, poolSize, options)
        : loadStylelint(options);
  }

  return cache[cacheKey];
}

/**
 * @param {LinterContext} context linter context
 * @returns {Promise<LinterInstance>} stylelint linter
 */
async function create({ key, options, compilation }) {
  const loaded = getLoadedStylelint(key, options);
  const storage = getResultStorage(compilation.compiler);

  /** @type {LintResult[]} */
  let lastResults = [];

  return {
    async lintFiles(files) {
      const resolved = parseFiles(files, String(options.context));

      for (const file of resolved) {
        delete storage[file];
      }

      // One task per file keeps every worker of the pool busy.
      if (loaded.threads > 1) {
        const results = await Promise.all(
          resolved.map((file) => loaded.lintFiles(file)),
        );

        return results.flat();
      }

      return loaded.lintFiles(resolved);
    },
    async getResults(results) {
      for (const result of /** @type {LintResult[]} */ (results)) {
        if (result.ignored) continue;

        storage[String(result.source)] = result;
      }

      lastResults = Object.values(storage);

      return lastResults;
    },
    splitResults(results) {
      /** @type {LintResult[]} */
      const errors = [];
      /** @type {LintResult[]} */
      const warnings = [];

      for (const file of /** @type {LintResult[]} */ (results)) {
        const fileErrors = file.warnings.filter(
          (message) => options.emitError && message.severity === "error",
        );

        if (fileErrors.length > 0) {
          errors.push({ ...file, warnings: fileErrors });
        }

        const fileWarnings = file.warnings.filter(
          (message) => options.emitWarning && message.severity === "warning",
        );

        if (fileWarnings.length > 0) {
          warnings.push({ ...file, warnings: fileWarnings });
        }
      }

      return { errors, warnings };
    },
    async getFormatter(formatter) {
      const stylelint = await loaded.getStylelint();
      const loadedFormatter = await loadFormatter(stylelint, formatter);

      return async (results) => {
        /** @type {LinterResult} */
        const returnValue = {
          cwd: /** @type {string} */ (options.cwd),
          errored: false,
          results: [],
          report: "",
          reportedDisables: [],
          ruleMetadata: getRuleMetadata(lastResults),
        };

        return String(
          loadedFormatter(/** @type {LintResult[]} */ (results), returnValue),
        );
      };
    },
    cleanup: () => loaded.cleanup(),
  };
}

export { getLoadedStylelint, getStylelintOptions };

export default {
  name: "stylelint",
  label: "Stylelint",
  filesSource: "glob",
  schema,
  defaults: {
    cache: true,
    cacheLocation: "node_modules/.cache/lint-webpack-plugin/.stylelintcache",
    extensions: ["css", "scss", "sass"],
  },
  getLoadedStylelint,
  getStylelintOptions,
  /**
   * @param {Compiler} compiler compiler
   * @returns {string[]} default excluded globs
   */
  defaultExclude: (compiler) =>
    parseFiles(
      ["**/node_modules/**", String(compiler.options.output.path)],
      String(compiler.options.context),
    ),
  create,
};
