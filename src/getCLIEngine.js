import { getESLintOptions } from './options';

export default function getCLIEngine(options) {
  let { eslintPath } = options;

  if (!eslintPath) {
    eslintPath = 'eslint';
  }

  const { CLIEngine } = require(eslintPath);

  // Filter out loader options before passing the options to ESLint.
  const cli = new CLIEngine(getESLintOptions(options));
  return {
    CLIEngine,
    cli,
  };
}
