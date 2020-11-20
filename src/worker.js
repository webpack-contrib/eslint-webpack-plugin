/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.Options} ESLintOptions */

Object.assign(module.exports, {
  lintFiles,
  setup,
});

/** @type {ESLint} */
let eslint;

/**
 * @typedef {object} setupOptions
 * @property {string=} eslintPath - import path of eslint
 * @property {ESLintOptions=} eslintOptions - linter options
 *
 * @param {setupOptions} arg0 - setup worker
 */
function setup({ eslintPath, eslintOptions }) {
  const { ESLint } = require(eslintPath || 'eslint');
  eslint = new ESLint(eslintOptions);
}

/**
 * @param {string | string[]} files
 */
async function lintFiles(files) {
  return eslint.lintFiles(files);
}
