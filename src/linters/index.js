// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

const eslint = require("./eslint");
const stylelint = require("./stylelint");

/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("../options").LinterOptions} LinterOptions */

/**
 * A result produced by a linter, only the adapter that created it knows its shape.
 * @typedef {EXPECTED_ANY} LintResult
 */

/**
 * @typedef {string | ((results: LintResult[], ...args: EXPECTED_ANY[]) => string | Promise<string>)} FormatterOption
 */

/** @typedef {(results: LintResult[]) => Promise<string>} Format */

/**
 * @typedef {object} LinterContext
 * @property {string} key a key unique to the compiler the linter runs for
 * @property {LinterOptions} options resolved options for this linter
 * @property {Compilation} compilation the compilation being linted
 */

/**
 * @typedef {object} LinterInstance
 * @property {(files: string[]) => Promise<LintResult[]>} lintFiles lints the given files
 * @property {(results: LintResult[]) => Promise<LintResult[]>} getResults turns the raw results of every `lintFiles` call into the results to report
 * @property {(results: LintResult[]) => { errors: LintResult[], warnings: LintResult[] }} splitResults splits results into the ones reported as errors and as warnings
 * @property {(formatter?: FormatterOption) => Promise<Format>} getFormatter loads a formatter, falling back to the linter's default one
 * @property {() => Promise<void>} cleanup releases whatever the linter holds after a run
 */

/**
 * What a linter shipped outside this package has to provide; everything the
 * plugin can default is optional.
 * @typedef {object} LinterAdapterInput
 * @property {string} name the option key the linter is configured under
 * @property {(context: LinterContext) => Promise<LinterInstance>} create creates a linter for one compilation
 * @property {string=} label the human readable name, used in diagnostics
 * @property {"modules" | "glob"=} filesSource whether the linter lints the files webpack built or every file matching `files`
 * @property {{ properties: { [key: string]: EXPECTED_ANY } }=} schema JSON schema of the options only this linter understands
 * @property {{ [key: string]: EXPECTED_ANY }=} defaults default options for this linter
 * @property {((compiler: Compiler) => string | string[])=} defaultExclude the globs excluded when the user specifies none
 */

/**
 * @typedef {object} LinterAdapter
 * @property {string} name the option key the linter is configured under
 * @property {string} label the human readable name, used in diagnostics
 * @property {"modules" | "glob"} filesSource whether the linter lints the files webpack built or every file matching `files`
 * @property {{ properties: { [key: string]: EXPECTED_ANY } }} schema JSON schema of the options only this linter understands
 * @property {{ [key: string]: EXPECTED_ANY }} defaults default options for this linter
 * @property {(compiler: Compiler) => string | string[]} defaultExclude the globs excluded when the user specifies none
 * @property {(context: LinterContext) => Promise<LinterInstance>} create creates a linter for one compilation
 */

/** @type {Map<string, LinterAdapter>} */
const linters = new Map([
  [eslint.name, /** @type {LinterAdapter} */ (eslint)],
  [stylelint.name, /** @type {LinterAdapter} */ (stylelint)],
]);

module.exports = linters;
