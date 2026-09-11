// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

import { createRequire } from "node:module";

import { importFrom, omitPluginOptions } from "../utils.js";

/** @typedef {import("./index.js").CheckContext} CheckContext */
/** @typedef {import("./index.js").CheckInstance} CheckInstance */
/** @typedef {import("./index.js").Format} Format */
/** @typedef {import("./index.js").FormatterOption} FormatterOption */
/** @typedef {import("../options.js").CheckOptions} Options */

/** @typedef {EXPECTED_ANY} TypeScript */
/** @typedef {EXPECTED_ANY} Diagnostic */

const nodeRequire = createRequire(import.meta.url);

/** @type {{ plugin: EXPECTED_ANY, shared: EXPECTED_ANY, own: EXPECTED_ANY } | undefined} */
let schemas;

/**
 * Read on demand so that requiring the plugin does not read three files.
 * @returns {{ plugin: EXPECTED_ANY, shared: EXPECTED_ANY, own: EXPECTED_ANY }} the schemas
 */
function getSchemas() {
  if (!schemas) {
    schemas = {
      plugin: nodeRequire("../options.json"),
      shared: nodeRequire("../shared-options.json"),
      own: nodeRequire("./typescript.json"),
    };
  }

  return schemas;
}

/**
 * @param {Options} options plugin options
 * @returns {EXPECTED_ANY} the options TypeScript itself understands
 */
function getTypeScriptOptions(options) {
  return omitPluginOptions(options, {
    ...getSchemas().plugin.properties,
    ...getSchemas().shared.properties,
    ...getSchemas().own.properties,
  });
}

/**
 * The program the config file describes, with emit off: webpack writes the
 * output, so a check that wrote any of its own would fight it.
 * @param {TypeScript} ts the loaded TypeScript
 * @param {Options} options options
 * @returns {{ diagnostics: Diagnostic[], host: EXPECTED_ANY, files: string[] }} what it found, and what it read to find it
 */
function check(ts, options) {
  const context = String(options.context);
  const configFile =
    options.configFile ||
    ts.findConfigFile(context, ts.sys.fileExists, "tsconfig.json");

  /** @type {Diagnostic[]} */
  const unrecoverable = [];
  const host = {
    getCanonicalFileName: (/** @type {string} */ file) => file,
    getCurrentDirectory: () => context,
    getNewLine: () => ts.sys.newLine,
  };

  // Unreachable from the suite: every fixture sits under this repository's own
  // config, which the search finds on its way up.
  /* istanbul ignore next */
  if (!configFile) {
    throw new Error(
      `no 'tsconfig.json' was found above '${context}', and none was named by 'configFile'.`,
    );
  }

  const overrides = {
    ...getTypeScriptOptions(options),
    ...options.compilerOptions,
    // A check reports; webpack emits.
    noEmit: true,
  };

  const parsed = ts.getParsedCommandLineOfConfigFile(configFile, overrides, {
    ...ts.sys,
    getCurrentDirectory: () => context,
    onUnRecoverableConfigFileDiagnostic: (
      /** @type {Diagnostic} */ diagnostic,
    ) => unrecoverable.push(diagnostic),
  });

  if (!parsed) return { diagnostics: unrecoverable, host, files: [configFile] };

  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
    projectReferences: parsed.projectReferences,
  });

  const extended = parsed.options.configFile
    ? parsed.options.configFile.extendedSourceFiles || []
    : [];

  return {
    diagnostics: [
      ...unrecoverable,
      ...parsed.errors,
      ...ts.getPreEmitDiagnostics(program),
    ],
    host,
    // The config file decides which files the program holds, so reading it
    // again is what a change to it takes.
    files: [configFile, ...extended, ...parsed.fileNames],
  };
}

/**
 * @param {CheckContext} context check context
 * @returns {Promise<CheckInstance>} typescript check
 */
async function create({ options }) {
  const ts = await importFrom(options.typescriptPath || "typescript");
  /** @type {TypeScript} */
  const typescript = ts.default || ts;

  /** @type {EXPECTED_ANY} */
  let host;
  /** @type {string[]} */
  let read = [];
  // The program is the whole project, so it is built once however many batches
  // of files the plugin hands over.
  let checked = false;

  return {
    async lintFiles() {
      if (checked) return [];

      checked = true;

      const found = check(typescript, options);

      host = found.host;
      read = found.files;

      return found.diagnostics;
    },
    readFiles() {
      return read;
    },
    async getResults(results) {
      return results;
    },
    splitResults(results) {
      /** @type {Diagnostic[]} */
      const errors = [];
      /** @type {Diagnostic[]} */
      const warnings = [];

      for (const diagnostic of /** @type {Diagnostic[]} */ (results)) {
        if (diagnostic.category === typescript.DiagnosticCategory.Error) {
          errors.push(diagnostic);
        } else {
          warnings.push(diagnostic);
        }
      }

      return { errors, warnings };
    },
    async getFormatter(formatter) {
      if (typeof formatter === "function") {
        return async (results) => String(await formatter(results));
      }

      return async (results) =>
        typescript
          .formatDiagnosticsWithColorAndContext(
            /** @type {Diagnostic[]} */ (results),
            host,
          )
          .trim();
    },
    async cleanup() {},
  };
}

export { getTypeScriptOptions };

export default {
  name: "typescript",
  label: "TypeScript",
  // The program is the one the config file describes rather than the graph
  // webpack built, so a file nothing imports is still checked.
  filesSource: "glob",
  get schema() {
    return getSchemas().own;
  },
  defaults: {
    extensions: ["ts", "tsx", "mts", "cts"],
  },
  defaultExclude: () => "**/node_modules/**",
  create,
  // No `resultPath`: a diagnostic belongs to the program, not to the file the
  // plugin happened to hand over, so there is nothing to report a file from.
};
