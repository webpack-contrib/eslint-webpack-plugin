import { getESLintOptions } from './options';

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
