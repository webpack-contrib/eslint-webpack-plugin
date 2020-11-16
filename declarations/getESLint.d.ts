/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('./options').Options} Options */
/**
 * @param {Options} options
 * @returns {{ESLint: ESLint, eslint: ESLint}}
 */
export default function getESLint(
  options: Options
): {
  ESLint: import('eslint').ESLint;
  eslint: import('eslint').ESLint;
};
export type ESLint = import('eslint').ESLint;
export type Options = import('./options').PluginOptions &
  import('eslint').ESLint.Options;
