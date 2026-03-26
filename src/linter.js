const { dirname, isAbsolute, join } = require("node:path");

const ESLintError = require("./ESLintError");
const { getESLint } = require("./getESLint");

/** @typedef {import("eslint").ESLint} ESLint */
/** @typedef {import("eslint").ESLint.Formatter} Formatter */
/** @typedef {import("eslint").ESLint.LintResult} LintResult */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("./options").Options} Options */
/** @typedef {import("./options").FormatterFunction} FormatterFunction */
/** @typedef {(compilation: Compilation) => Promise<void>} GenerateReport */
/** @typedef {{ errors?: ESLintError, warnings?: ESLintError, generateReportAsset?: GenerateReport }} Report */
/** @typedef {() => Promise<Report>} Reporter */
/** @typedef {(files: string | string[]) => void} Linter */
/** @typedef {{ [files: string]: LintResult }} LintResultMap */

/**
 * @param {Promise<LintResult[]>[]} results results
 * @returns {Promise<LintResult[]>} flatted results
 */
async function flatten(results) {
  /**
   * @param {LintResult[]} acc acc
   * @param {LintResult[]} list list
   * @returns {LintResult[]} result
   */
  const flat = (acc, list) => [...acc, ...list];
  return (await Promise.all(results)).reduce(flat, []);
}

/**
 * @param {ESLint} eslint eslint
 * @param {LintResult[]} results results
 * @returns {Promise<LintResult[]>} result without warnings
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

  return (await Promise.all(filterPromises)).filter(
    (result) => result !== false,
  );
}

/**
 * @param {ESLint} eslint eslint
 * @param {string | FormatterFunction=} formatter formatter
 * @returns {Promise<Formatter>} loaded formatter
 */
async function loadFormatter(eslint, formatter) {
  if (typeof formatter === "function") {
    return { format: formatter };
  }

  if (typeof formatter === "string") {
    try {
      return eslint.loadFormatter(formatter);
    } catch {
      // Load the default formatter.
    }
  }

  return eslint.loadFormatter();
}

/**
 * @param {Formatter} formatter formatter
 * @param {{ errors: LintResult[], warnings: LintResult[] }} results results
 * @returns {Promise<{ errors?: ESLintError, warnings?: ESLintError }>} errors and warnings
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
 * @param {LintResult} file file
 * @returns {boolean} true when has errors, otherwise false
 */
function fileHasErrors(file) {
  return file.errorCount > 0;
}

/**
 * @param {LintResult} file file
 * @returns {boolean} true when has warnings, otherwise false
 */
function fileHasWarnings(file) {
  return file.warningCount > 0;
}

/**
 * @param {Options} options options results
 * @param {LintResult[]} results results
 * @returns {{ errors: LintResult[], warnings: LintResult[] }} parsed errors and warnings
 */
function parseResults(options, results) {
  /** @type {LintResult[]} */
  const errors = [];

  /** @type {LintResult[]} */
  const warnings = [];

  for (const file of results) {
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
  }

  return {
    errors,
    warnings,
  };
}

/**
 * @param {string | undefined} key a cache key
 * @param {Options} options options
 * @param {Compilation} compilation compilation
 * @returns {Promise<{ lint: Linter, report: Reporter, threads: number }>} linter with additional functions
 */
async function linter(key, options, compilation) {
  /** @type {ESLint} */
  let eslint;

  /** @type {(files: string | string[]) => Promise<LintResult[]>} */
  let lintFiles;

  /** @type {() => Promise<void>} */
  let cleanup;

  /** @type number */
  let threads;

  /** @type {Promise<LintResult[]>[]} */
  const rawResults = [];

  try {
    ({ eslint, lintFiles, cleanup, threads } = await getESLint(key, options));
  } catch (err) {
    throw new ESLintError(err.message);
  }

  /**
   * @param {string | string[]} files files
   */
  function lint(files) {
    rawResults.push(
      lintFiles(files).catch((err) => {
        compilation.errors.push(new ESLintError(err.message));
        return [];
      }),
    );
  }

  /**
   * @returns {Promise<Report>} report
   */
  async function report() {
    // Filter out ignored files.
    const results = await removeIgnoredWarnings(
      eslint,
      // Get the current results, resetting the rawResults to empty
      await flatten(rawResults.splice(0)),
    );

    await cleanup();

    // do not analyze if there are no results or eslint config
    if (!results || results.length < 1) {
      return {};
    }

    const formatter = await loadFormatter(eslint, options.formatter);
    const { errors, warnings } = await formatResults(
      formatter,
      parseResults(options, results),
    );

    /**
     * @param {Compilation} compilation compilation
     * @returns {Promise<void>}
     */
    async function generateReportAsset({ compiler }) {
      const { outputReport } = options;
      /**
       * @param {string} name name
       * @param {string | Buffer} content content
       * @returns {Promise<void>}
       */
      const save = (name, content) =>
        /** @type {Promise<void>} */
        (
          new Promise((finish, bail) => {
            if (!compiler.outputFileSystem) return;

            const { mkdir, writeFile } = compiler.outputFileSystem;

            mkdir(dirname(name), { recursive: true }, (err) => {
              /* istanbul ignore if */
              if (err) {
                bail(err);
              } else {
                writeFile(name, content, (/** @type {unknown} */ err2) => {
                  /* istanbul ignore if */
                  if (err2) bail(err2);
                  else finish();
                });
              }
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

    return {
      errors,
      warnings,
      generateReportAsset,
    };
  }

  return {
    lint,
    report,
    threads,
  };
}

module.exports = linter;
