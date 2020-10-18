import { join } from 'path';

import ESLintPlugin from '../../src/index';

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
        // this disables the use of .eslintignore, since it contains the fixtures
        // folder to skip it on the global linting, but here we want the opposite
        // (we only use .eslintignore on the test that checks this)
        ignore: false,
        ...pluginConf,
      }),
    ],
    ...webpackConf,
  };
};
