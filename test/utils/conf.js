import { join } from "node:path";
import ESLintPlugin from "../../src";

export default (entry, pluginConf = {}, webpackConf = {}) => {
  const testDir = join(__dirname, "..");

  return {
    entry: `./${entry}-entry.js`,
    context: join(testDir, "fixtures"),
    mode: "development",
    output: {
      path: join(testDir, "outputs"),
    },
    plugins: [
      new ESLintPlugin({
        // Do not cache for tests
        cache: false,
        overrideConfigFile: join(
          testDir,
          "./config-for-tests/eslint.config.mjs",
        ),
        // this disables the use of .eslintignore, since it contains the fixtures
        // folder to skip it on the global linting, but here we want the opposite
        ignore: false,
        ...pluginConf,
      }),
    ],
    ...webpackConf,
  };
};
