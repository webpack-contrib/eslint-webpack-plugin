import { getESLintOptions } from './options';

/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('./options').Options} Options */

/**
 * @param {Options} options
 * @returns {{ESLint: ESLint, eslint: ESLint}}
 */
export default function getESLint(options) {
  let { eslintPath } = options;

  if (!eslintPath) {
    eslintPath = 'eslint';
  }

  const { ESLint } = require(eslintPath);

  // Filter out loader options before passing the options to ESLint.
  const eslint = new ESLint(getESLintOptions(options));

  return {
    ESLint,
    eslint,
  };
}
