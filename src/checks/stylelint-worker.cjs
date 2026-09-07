"use strict";

// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

const { isAbsolute } = require("node:path");
const { pathToFileURL } = require("node:url");

/** @typedef {import("./stylelint.js").LintResult} LintResult */
/** @typedef {import("./stylelint.js").StylelintOptions} StylelintOptions */
/** @typedef {import("./stylelint.js").Stylelint} Stylelint */
/** @typedef {import("../options.js").CheckOptions} Options */

/** @type {string} */
let stylelintPath = "stylelint";

/** @type {Partial<StylelintOptions>} */
let linterOptions;

/** @type {Promise<Stylelint> | null} */
let stylelintPromise = null;

/**
 * A package name is imported as it is; a path may name a directory or a
 * CommonJS entry, neither of which ESM resolves, so it is resolved first.
 * @param {string} specifier a module specifier or path
 * @returns {Promise<EXPECTED_ANY>} the imported module
 */
async function importFrom(specifier) {
  if (!specifier.startsWith(".") && !isAbsolute(specifier)) {
    return import(specifier);
  }

  try {
    return await import(pathToFileURL(require.resolve(specifier)).href);
  } catch {
    return import(specifier);
  }
}

/**
 * Lazily load stylelint on first use.
 * @returns {Promise<Stylelint>} stylelint instance
 */
async function getStylelint() {
  if (!stylelintPromise) {
    stylelintPromise = (async () => {
      const mod = await importFrom(stylelintPath);
      // A `stylelintPath` may name a CommonJS module, which has no default export
      return mod.default || mod;
    })();
  }

  return stylelintPromise;
}

/**
 * @param {Options} options the worker options
 * @param {Partial<StylelintOptions>} stylelintOptions the stylelint options
 */
function setup(options, stylelintOptions) {
  stylelintPath = options.stylelintPath || "stylelint";
  linterOptions = stylelintOptions;
  // Reset cached stylelint in case path changed
  stylelintPromise = null;
}

/**
 * @param {string | string[]} files files
 * @returns {Promise<LintResult[]>} results
 */
async function lintFiles(files) {
  const stylelint = await getStylelint();
  const { results } = await stylelint.lint({
    ...linterOptions,
    files,
    quietDeprecationWarnings: true,
  });

  // Reset result to work with worker
  return results.map((result) => ({
    source: result.source,
    errored: result.errored,
    ignored: result.ignored,
    warnings: result.warnings,
    deprecations: result.deprecations,
    invalidOptionWarnings: result.invalidOptionWarnings,
    parseErrors: result.parseErrors,
  }));
}

module.exports = { getStylelint, lintFiles, setup };
