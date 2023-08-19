/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.Options} ESLintOptions */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('./linter').File} File */

Object.assign(module.exports, {
  lintFiles,
  setup,
});

/** @type {{ new (arg0: ESLintOptions): ESLint; outputFixes: (arg0: LintResult[]) => any; }} */
let ESLint;

/** @type {ESLint} */
let eslint;

/** @type {boolean} */
let fix;

/**
 * @typedef {object} setupOptions
 * @property {string=} eslintPath - import path of eslint
 * @property {ESLintOptions=} eslintOptions - linter options
 *
 * @param {setupOptions} arg0 - setup worker
 */
function setup({ eslintPath, eslintOptions = {} }) {
  fix = !!(eslintOptions && eslintOptions.fix);
  ({ ESLint } = require(eslintPath || 'eslint'));
  eslint = new ESLint(eslintOptions);
}

/**
 * @param {File[]} files
 */
async function lintFiles(files) {
  /** @type {LintResult[]} */
  const results = [];

  await Promise.all(
    files.map(async (file) => {
      const result = await eslint.lintText(file.content, {
        filePath: file.path,
      });
      /* istanbul ignore if */
      if (result) {
        results.push(...result);
      }
    })
  );

  // istanbul ignore else
  if (fix) {
    await ESLint.outputFixes(results);
  }

  return results;
}
