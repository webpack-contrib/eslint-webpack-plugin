// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";

import { toPosixPath } from "../utils.js";

/** @typedef {import("./index.js").CheckContext} CheckContext */
/** @typedef {import("./index.js").CheckInstance} CheckInstance */
/** @typedef {import("../options.js").CheckOptions} Options */

/**
 * @typedef {object} FileResult
 * @property {string} filename the file every diagnostic of it was found in
 * @property {Diagnostic[]} diagnostics what oxlint found there
 */

/**
 * @typedef {object} Diagnostic
 * @property {string} message what oxlint found
 * @property {string=} code the rule it came from
 * @property {string} severity how oxlint rates it
 * @property {string} filename the file it was found in
 * @property {string=} help what oxlint suggests
 * @property {{ label?: string, span: { line: number, column: number } }[]=} labels where it is
 */

const nodeRequire = createRequire(import.meta.url);

// An argument list is not unbounded, so a batch past this is run in several.
const FILES_PER_RUN = 500;

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
      own: nodeRequire("./oxlint.json"),
    };
  }

  return schemas;
}

/**
 * oxlint is a binary behind a Node entry rather than a library, so it is run
 * rather than called.
 * @param {Options} options options
 * @returns {string} the script that runs it
 */
function findOxlint(options) {
  const specifier = options.oxlintPath || "oxlint";
  const manifest = nodeRequire.resolve(join(specifier, "package.json"));
  const { bin } = nodeRequire(manifest);

  return resolve(dirname(manifest), typeof bin === "string" ? bin : bin.oxlint);
}

/**
 * @param {string} script the oxlint entry to run
 * @param {string[]} args what to run it with
 * @param {string} cwd where to run it
 * @returns {Promise<Diagnostic[]>} what it found
 */
function run(script, args, cwd) {
  return new Promise((promiseResolve, reject) => {
    execFile(
      process.execPath,
      [script, ...args],
      // A project's worth of diagnostics does not fit the default buffer.
      { cwd, maxBuffer: 64 * 1024 * 1024 },
      (error, stdout) => {
        // oxlint answers non-zero when it found something, which is not a
        // failure to run; an empty answer with an error is.
        if (!stdout && error) {
          reject(error);
          return;
        }

        try {
          promiseResolve(JSON.parse(stdout).diagnostics || []);
        } /* istanbul ignore next -- oxlint declines a second `--format` rather
             than answering in one this cannot read, so nothing reaches here
             short of oxlint changing what `--format=json` prints */ catch {
          reject(
            new Error(
              `oxlint answered something other than the JSON it was asked for: ${stdout.slice(0, 200)}`,
            ),
          );
        }
      },
    );
  });
}

/**
 * @param {string} filename the file it was found in
 * @param {Diagnostic} diagnostic what oxlint found
 * @returns {string} it as one line, where oxlint's own formatters are a second run
 */
function formatDiagnostic(filename, diagnostic) {
  const [label] = diagnostic.labels || [];
  const at = label ? `:${label.span.line}:${label.span.column}` : "";
  const rule = diagnostic.code ? `  ${diagnostic.code}` : "";

  return `${filename}${at}  ${diagnostic.severity}  ${diagnostic.message}${rule}`;
}

/**
 * @param {CheckContext} context check context
 * @returns {Promise<CheckInstance>} oxlint check
 */
async function create({ options }) {
  const script = findOxlint(options);
  const cwd = String(options.context);
  const flags = [
    "--format=json",
    ...(options.configFile ? ["--config", String(options.configFile)] : []),
    ...(options.fix ? ["--fix"] : []),
    .../** @type {string[]} */ (options.args || []),
  ];

  return {
    async lintFiles(files) {
      /** @type {Diagnostic[]} */
      const found = [];

      for (let i = 0; i < files.length; i += FILES_PER_RUN) {
        found.push(
          ...(await run(
            script,
            [...flags, ...files.slice(i, i + FILES_PER_RUN)],
            cwd,
          )),
        );
      }

      return found;
    },
    async getResults(results) {
      // One result per file rather than per diagnostic: the plugin remembers a
      // file by one result, so several would leave only the last of them. The
      // path is made absolute at the same time, being named relative to where
      // oxlint ran and remembered as webpack spells it.
      /** @type {Map<string, FileResult>} */
      const byFile = new Map();

      for (const diagnostic of /** @type {Diagnostic[]} */ (results)) {
        const filename = toPosixPath(resolve(cwd, diagnostic.filename));
        const found = byFile.get(filename);

        if (found) found.diagnostics.push(diagnostic);
        else byFile.set(filename, { filename, diagnostics: [diagnostic] });
      }

      return [...byFile.values()];
    },
    splitResults(results) {
      /** @type {FileResult[]} */
      const errors = [];
      /** @type {FileResult[]} */
      const warnings = [];

      // A file holding both is reported in both, each with its own half.
      for (const file of /** @type {FileResult[]} */ (results)) {
        for (const [severity, into] of [
          ["error", errors],
          ["warning", warnings],
        ]) {
          const diagnostics = file.diagnostics.filter(
            (diagnostic) =>
              (diagnostic.severity === "error") === (severity === "error"),
          );

          if (diagnostics.length > 0) {
            /** @type {FileResult[]} */ (into).push({ ...file, diagnostics });
          }
        }
      }

      return { errors, warnings };
    },
    async getFormatter(formatter) {
      if (typeof formatter === "function") {
        return async (results) => String(await formatter(results));
      }

      return async (results) =>
        /** @type {FileResult[]} */ (results)
          .flatMap((file) =>
            file.diagnostics.map((diagnostic) =>
              formatDiagnostic(file.filename, diagnostic),
            ),
          )
          .join("\n");
    },
    async cleanup() {},
  };
}

export default {
  name: "oxlint",
  label: "oxlint",
  filesSource: "modules",
  get schema() {
    return getSchemas().own;
  },
  defaults: {
    extensions: ["js", "mjs", "cjs", "jsx", "ts", "mts", "cts", "tsx"],
  },
  defaultExclude: () => "**/node_modules/**",
  create,
  resultPath: (/** @type {EXPECTED_ANY} */ result) =>
    /** @type {FileResult} */ (result).filename,
};
