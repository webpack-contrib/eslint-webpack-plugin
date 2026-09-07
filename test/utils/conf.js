import { join } from "node:path";

import DiagnosticsPlugin from "../../src/index.js";

// Options the plugin only accepts next to the check entries, not inside one.
const PLUGIN_OPTIONS = ["context", "lintDirtyModulesOnly"];

export default (entry, pluginConf = {}, webpackConf = {}) => {
  const testDir = join(import.meta.dirname, "..");
  const plugin = {};
  const eslint = {
    // Do not cache for tests
    cache: false,
    overrideConfigFile: join(testDir, "./config-for-tests/eslint.config.mjs"),
    // this disables the use of .eslintignore, since it contains the fixtures
    // folder to skip it on the global linting, but here we want the opposite
    ignore: false,
  };

  for (const [option, value] of Object.entries(pluginConf)) {
    if (PLUGIN_OPTIONS.includes(option)) {
      plugin[option] = value;
    } else {
      eslint[option] = value;
    }
  }

  return {
    entry: `./${entry}-entry.js`,
    context: join(testDir, "fixtures"),
    mode: "development",
    output: {
      path: join(testDir, "outputs"),
    },
    plugins: [
      new DiagnosticsPlugin({
        ...plugin,
        checks: [{ use: "eslint", ...eslint }],
      }),
    ],
    ...webpackConf,
  };
};
