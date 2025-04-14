import { join } from 'path';

import ESLintPlugin from '../../src';

export default (entry, pluginConf = {}, webpackConf = {}) => {
  const testDir = join(__dirname, '..');

  return {
    entry: `./${entry}-entry.js`,
    context: join(testDir, 'fixtures'),
    mode: 'development',
    output: {
      path: join(testDir, 'output'),
    },
    plugins: [
      new ESLintPlugin({
        configType: 'eslintrc',
        // this disables the use of .eslintignore, since it contains the fixtures
        // folder to skip it on the global linting, but here we want the opposite
        // (we only use .eslintignore on the test that checks this)
        ignore: false,
        // TODO: update tests to run both states: test.each([[{threads: false}], [{threads: true}]])('it should...', async ({threads}) => {...})
        threads: true,
        failOnError: false,
        ...pluginConf,
      }),
    ],
    ...webpackConf,
  };
};
