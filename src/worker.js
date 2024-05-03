/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.Options} ESLintOptions */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {{new (arg0: ESLintOptions): ESLint; outputFixes: (arg0: LintResult[]) => any;}} ESLintClass */

Object.assign(module.exports, {
  lintFiles,
  setup,
});

/** @type {ESLintClass} */
let ESLint;

/** @type {ESLint} */
let eslint;

/** @type {boolean} */
let fix;

/**
 * @typedef {object} setupOptions
 * @property {string=} eslintPath - import path of eslint
 * @property {string=} configType
 * @property {ESLintOptions} eslintOptions - linter options
 *
 * @param {setupOptions} arg0 - setup worker
 */
function setup({ eslintPath, configType, eslintOptions }) {
  fix = !!(eslintOptions && eslintOptions.fix);
  const eslintModule = require(eslintPath || 'eslint');

  if (eslintModule.ESLint && parseFloat(eslintModule.ESLint.version) >= 9) {
    return eslintModule
      .loadESLint({ useFlatConfig: configType === 'flat' })
      .then((/** @type {ESLintClass} */ classESLint) => {
        ESLint = classESLint;
        eslint = new ESLint(eslintOptions);
        return eslint;
      });
  }

  let FlatESLint;

  if (eslintModule.LegacyESLint) {
    ESLint = eslintModule.LegacyESLint;
    ({ FlatESLint } = eslintModule);
  } else {
    ({ ESLint } = eslintModule);

    if (configType === 'flat') {
      throw new Error(
        "Couldn't find FlatESLint, you might need to set eslintPath to 'eslint/use-at-your-own-risk'",
      );
    }
  }

  if (configType === 'flat') {
    eslint = new FlatESLint(eslintOptions);
  } else {
    eslint = new ESLint(eslintOptions);
  }

  return eslint;
}

/**
 * @param {string | string[]} files
 */
async function lintFiles(files) {
  /** @type {LintResult[]} */
  const result = await eslint.lintFiles(files);
  // if enabled, use eslint autofixing where possible
  if (fix) {
    await ESLint.outputFixes(result);
  }
  return result;
}
