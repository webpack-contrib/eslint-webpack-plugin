export default function getCLIEngine(options, startCli = true) {
  let { eslintPath, CLIEngine, cli } = options;

  if (!eslintPath) {
    eslintPath = 'eslint';

    // eslint-disable-next-line no-param-reassign
    options.eslintPath = eslintPath;
  }

  if (!CLIEngine) {
    ({ CLIEngine } = require(eslintPath));

    // eslint-disable-next-line no-param-reassign
    options.CLIEngine = CLIEngine;
  }

  if (!cli && startCli) {
    cli = new CLIEngine(options);

    // eslint-disable-next-line no-param-reassign
    options.cli = cli;
  }

  return {
    eslintPath,
    CLIEngine,
    cli,
  };
}
