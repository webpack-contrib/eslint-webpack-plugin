import { join } from 'path';

import ESLintPlugin from '../../src/index';

export default (entry, pluginConf = {}, webpackConf = {}) => {
  const testDir = join(__dirname, '..');
  const files = typeof entry === 'string' ? `./${entry}.js` : entry;

  return {
    entry: './index.js',
    context: join(testDir, 'fixtures'),
    mode: 'development',
    output: {
      path: join(testDir, 'output'),
    },
    plugins: [
      new ESLintPlugin({
        files,

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
