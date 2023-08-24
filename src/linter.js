const { dirname, isAbsolute, join } = require('path');

const ESLintError = require('./ESLintError');
const { getESLint } = require('./getESLint');

/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.Formatter} Formatter */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('webpack').Compilation} Compilation */
/** @typedef {import('./options').Options} Options */
/** @typedef {import('./options').FormatterFunction} FormatterFunction */
/** @typedef {(compilation: Compilation) => Promise<void>} GenerateReport */
/** @typedef {{errors?: ESLintError, warnings?: ESLintError, generateReportAsset?: GenerateReport}} Report */
/** @typedef {() => Promise<Report>} Reporter */
/** @typedef {{path: string, content: string}} File */
/** @typedef {(files: File[]) => void} Linter */
/** @typedef {{[paths: string]: LintResult}} LintResultMap */

/** @type {WeakMap<Compiler, LintResultMap>} */
const resultStorage = new WeakMap();

/**
 * @param {string|undefined} key
 * @param {Options} options
 * @param {Compilation} compilation
 * @returns {{lint: Linter, report: Reporter, threads: number}}
 */
function linter(key, options, compilation) {
  /** @type {ESLint} */
  let eslint;

  /** @type {(files: File[]) => Promise<LintResult[]>} */
  let lintFiles;

  /** @type {() => Promise<void>} */
  let cleanup;

  /** @type number */
  let threads;

  /** @type {Promise<LintResult[]>[]} */
  const rawResults = [];

  const crossRunResultStorage = getResultStorage(compilation);

  try {
    ({ eslint, lintFiles, cleanup, threads } = getESLint(key, options));
  } catch (e) {
    throw new ESLintError(e.message);
  }

  return {
    lint,
    report,
    threads,
  };

  /**
   * @param {File[]} files
   */
  function lint(files) {
    for (const file of files) {
      delete crossRunResultStorage[file.path];
    }
    rawResults.push(
      lintFiles(files).catch((e) => {
        // @ts-ignore
        compilation.errors.push(new ESLintError(e.message));
        return [];
      }),
    );
  }

  async function report() {
    // Filter out ignored files.
    let results = await removeIgnoredWarnings(
      eslint,
      // Get the current results, resetting the rawResults to empty
      await flatten(rawResults.splice(0, rawResults.length)),
    );

    await cleanup();

    for (const result of results) {
      crossRunResultStorage[result.filePath] = result;
    }

    results = Object.values(crossRunResultStorage);

    // do not analyze if there are no results or eslint config
    if (!results || results.length < 1) {
      return {};
    }

    const formatter = await loadFormatter(eslint, options.formatter);
    const { errors, warnings } = await formatResults(
      formatter,
      parseResults(options, results),
    );

    return {
      errors,
      warnings,
      generateReportAsset,
    };

    /**
     * @param {Compilation} compilation
     * @returns {Promise<void>}
     */
    async function generateReportAsset({ compiler }) {
      const { outputReport } = options;
      /**
       * @param {string} name
       * @param {string|Buffer} content
       */
      const save = (name, content) =>
        /** @type {Promise<void>} */ (
          new Promise((finish, bail) => {
            const { mkdir, writeFile } = compiler.outputFileSystem;
            // ensure directory exists
            // @ts-ignore - the types for `outputFileSystem` are missing the 3 arg overload
            mkdir(dirname(name), { recursive: true }, (err) => {
              /* istanbul ignore if */
              if (err) bail(err);
              else
                writeFile(name, content, (err2) => {
                  /* istanbul ignore if */
                  if (err2) bail(err2);
                  else finish();
                });
            });
          })
        );

      if (!outputReport || !outputReport.filePath) {
        return;
      }

      const content = await (outputReport.formatter
        ? (await loadFormatter(eslint, outputReport.formatter)).format(results)
        : formatter.format(results));

      let { filePath } = outputReport;
      if (!isAbsolute(filePath)) {
        filePath = join(compiler.outputPath, filePath);
      }

      await save(filePath, content);
    }
  }
}

/**
 * @param {Formatter} formatter
 * @param {{ errors: LintResult[]; warnings: LintResult[]; }} results
 * @returns {Promise<{errors?: ESLintError, warnings?: ESLintError}>}
 */
async function formatResults(formatter, results) {
  let errors;
  let warnings;
  if (results.warnings.length > 0) {
    warnings = new ESLintError(await formatter.format(results.warnings));
  }

  if (results.errors.length > 0) {
    errors = new ESLintError(await formatter.format(results.errors));
  }

  return {
    errors,
    warnings,
  };
}

/**
 * @param {Options} options
 * @param {LintResult[]} results
 * @returns {{errors: LintResult[], warnings: LintResult[]}}
 */
function parseResults(options, results) {
  /** @type {LintResult[]} */
  const errors = [];

  /** @type {LintResult[]} */
  const warnings = [];

  results.forEach((file) => {
    if (fileHasErrors(file)) {
      const messages = file.messages.filter(
        (message) => options.emitError && message.severity === 2,
      );

      if (messages.length > 0) {
        errors.push({ ...file, messages });
      }
    }

    if (fileHasWarnings(file)) {
      const messages = file.messages.filter(
        (message) => options.emitWarning && message.severity === 1,
      );

      if (messages.length > 0) {
        warnings.push({ ...file, messages });
      }
    }
  });

  return {
    errors,
    warnings,
  };
}

/**
 * @param {LintResult} file
 * @returns {boolean}
 */
function fileHasErrors(file) {
  return file.errorCount > 0;
}

/**
 * @param {LintResult} file
 * @returns {boolean}
 */
function fileHasWarnings(file) {
  return file.warningCount > 0;
}

/**
 * @param {ESLint} eslint
 * @param {string|FormatterFunction=} formatter
 * @returns {Promise<Formatter>}
 */
async function loadFormatter(eslint, formatter) {
  if (typeof formatter === 'function') {
    return { format: formatter };
  }

  if (typeof formatter === 'string') {
    try {
      return eslint.loadFormatter(formatter);
    } catch (_) {
      // Load the default formatter.
    }
  }

  return eslint.loadFormatter();
}

/**
 * @param {ESLint} eslint
 * @param {LintResult[]} results
 * @returns {Promise<LintResult[]>}
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
    // istanbul ignore next
    const ignored =
      messages.length === 0 ||
      (hasWarning &&
        !firstMessage.fatal &&
        !firstMessage.ruleId &&
        !firstMessage.line &&
        (await eslint.isPathIgnored(filePath)));
    return ignored ? false : result;
  });

  // @ts-ignore
  return (await Promise.all(filterPromises)).filter(Boolean);
}

/**
 * @param {Promise<LintResult[]>[]} results
 * @returns {Promise<LintResult[]>}
 */
async function flatten(results) {
  /**
   * @param {LintResult[]} acc
   * @param {LintResult[]} list
   */
  const flat = (acc, list) => [...acc, ...list];
  return (await Promise.all(results)).reduce(flat, []);
}

/**
 * @param {Compilation} compilation
 * @returns {LintResultMap}
 */
function getResultStorage({ compiler }) {
  let storage = resultStorage.get(compiler);
  if (!storage) {
    resultStorage.set(compiler, (storage = {}));
  }
  return storage;
}

module.exports = linter;
