import { isAbsolute, join } from "node:path";

import DiagnosticError from "./DiagnosticError.js";
import { reportedAs } from "./options.js";
import { toPosixPath } from "./utils.js";

/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("./checks/index.js").CheckResult} CheckResult */
/** @typedef {import("./checks/index.js").CheckInstance} CheckInstance */
/** @typedef {import("./options.js").EnabledCheck} EnabledCheck */
/** @typedef {{ filePath: string, content: string }} OutputReportContent */
/** @typedef {{ errors?: DiagnosticError, warnings?: DiagnosticError, outputReport?: OutputReportContent }} Report */
/** @typedef {{ lint: (files: string[]) => void, keep: (files: string[]) => void, keepKnown: (removed: ReadonlySet<string>) => void, report: () => Promise<Report> }} Runner */
/** @typedef {Map<string, CheckResult | undefined>} ResultStore */

/** @type {WeakMap<Compilation["compiler"], Map<string, ResultStore>>} */
const resultStores = new WeakMap();

/**
 * The results of the last compilation, so a rebuild lints what webpack rebuilt
 * and reports the rest from here.
 * @param {Compilation} compilation compilation
 * @param {string} check a key unique to the check within the compiler
 * @returns {ResultStore} what the check last found in every file it covered
 */
function getResultStore(compilation, check) {
  const { compiler } = compilation;
  let stores = resultStores.get(compiler);

  if (!stores) {
    stores = new Map();
    resultStores.set(compiler, stores);
  }

  let store = stores.get(check);

  if (!store) {
    store = new Map();
    stores.set(check, store);
  }

  return store;
}

/**
 * @param {Promise<CheckResult[]>[]} results results
 * @returns {Promise<CheckResult[]>} flattened results
 */
async function flatten(results) {
  /**
   * @param {CheckResult[]} acc acc
   * @param {CheckResult[]} list list
   * @returns {CheckResult[]} result
   */
  const flat = (acc, list) => [...acc, ...list];
  return (await Promise.all(results)).reduce(flat, []);
}

/**
 * Creates the check synchronously so that the compilation hooks are tapped
 * before webpack starts building modules, whatever the tool takes to load.
 * @param {string} key a key unique to the compiler the check runs for
 * @param {EnabledCheck} check the check to run
 * @param {Compilation} compilation compilation
 * @returns {Runner} the runner collecting and reporting the results
 */
function createCheckRunner(key, { name, adapter, options }, compilation) {
  /** @type {Promise<CheckInstance | null>} */
  const pending = adapter.create({ key, options, compilation }).catch((err) => {
    compilation.errors.push(new DiagnosticError(name, err.message));
    return null;
  });

  /** @type {Promise<CheckResult[]>[]} */
  const rawResults = [];
  const store = getResultStore(compilation, `${key}:${name}`);
  // A check that cannot say which file a result came from is linted whole.
  const { resultPath } = adapter;
  /** @type {Set<string>} */
  const covered = new Set();
  /** @type {Set<string>} */
  const linted = new Set();
  // A check that cannot lint fails the same way for every batch it is given.
  let failed = false;

  /**
   * @param {string[]} files files
   */
  function lint(files) {
    for (const file of files) {
      covered.add(file);
      linted.add(file);
    }

    rawResults.push(
      pending
        .then((instance) => (instance ? instance.lintFiles(files) : []))
        .catch((err) => {
          if (!failed) {
            failed = true;
            compilation.errors.push(new DiagnosticError(name, err.message));
          }

          return [];
        }),
    );
  }

  /**
   * Reports a file from the last compilation rather than linting it again.
   * A file the store does not hold is linted: webpack restores a module from
   * its own cache without building it, and the first run of a compiler that
   * does so has nothing to report it from.
   * @param {string[]} files the files webpack did not rebuild
   */
  function keep(files) {
    if (!resultPath) {
      lint(files);
      return;
    }

    /** @type {string[]} */
    const unknown = [];

    for (const file of files) {
      if (store.has(file)) covered.add(file);
      else unknown.push(file);
    }

    if (unknown.length > 0) lint(unknown);
  }

  /**
   * Keeps every file the last compilation covered bar the ones webpack says
   * are gone — what a check that walks the file system knows about the files
   * it is not being told changed, without walking it again.
   * @param {ReadonlySet<string>} removed the files webpack no longer sees
   */
  function keepKnown(removed) {
    if (!resultPath) return;

    for (const file of store.keys()) {
      if (!removed.has(file)) covered.add(file);
    }
  }

  /**
   * Puts what was just linted into the store, drops what webpack no longer
   * builds, and answers with the results for every file this compilation
   * covers — the fresh ones and the ones kept from the last.
   * @param {CheckResult[]} results what the check produced this time
   * @returns {CheckResult[]} the results to report
   */
  function remember(results) {
    if (!resultPath) return results;

    // A check reports nothing for a file it found nothing in, so what was
    // linted is forgotten first and only what came back is put back.
    for (const file of linted) store.delete(file);

    // A result the check cannot put a file to is reported as it is: it is
    // this compilation's, and there is nothing to remember it under.
    /** @type {CheckResult[]} */
    const loose = [];

    for (const result of results) {
      const file = resultPath(result);

      if (file) store.set(toPosixPath(file), result);
      else loose.push(result);
    }

    // A file a check found nothing in is remembered as nothing found, which is
    // what tells a rebuild it has been linted at all.
    for (const file of linted) {
      if (!store.has(file)) store.set(file, undefined);
    }

    for (const file of store.keys()) {
      if (!covered.has(file)) store.delete(file);
    }

    return [...store.values(), ...loose].filter(Boolean);
  }

  /**
   * @returns {Promise<Report>} report
   */
  async function report() {
    const instance = await pending;

    if (!instance) return {};

    // Get the current results, resetting the raw results to empty.
    const raw = await flatten(rawResults.splice(0));

    await instance.cleanup();

    const results = remember(await instance.getResults(raw));

    // Do not analyze when the check reported nothing.
    if (!results || results.length === 0) {
      return {};
    }

    const format = await instance.getFormatter(options.formatter);
    const { errors, warnings } = instance.splitResults(results);

    /** @type {Report} */
    const report = {};

    // What `reportAs` drops is not formatted at all, but an `outputReport` is
    // still written from all of the results below.
    if (warnings.length > 0 && reportedAs(options.reportAs, "warnings")) {
      report.warnings = new DiagnosticError(name, await format(warnings));
    }

    if (errors.length > 0 && reportedAs(options.reportAs, "errors")) {
      report.errors = new DiagnosticError(name, await format(errors));
    }

    const { outputReport } = options;

    if (outputReport && outputReport.filePath) {
      const content = await (outputReport.formatter
        ? (await instance.getFormatter(outputReport.formatter))(results)
        : format(results));

      report.outputReport = {
        filePath: isAbsolute(outputReport.filePath)
          ? outputReport.filePath
          : join(compilation.compiler.outputPath, outputReport.filePath),
        content,
      };
    }

    return report;
  }

  return { keep, keepKnown, lint, report };
}

export default createCheckRunner;
