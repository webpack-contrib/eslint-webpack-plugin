import { join } from "node:path";

import LintPlugin from "../../../src";

// Options the plugin only accepts next to the linter groups, not inside one.
const PLUGIN_OPTIONS = ["context", "lintDirtyModulesOnly"];

export default (context, pluginConf = {}, webpackConf = {}) => {
  const testDir = join(__dirname, "..");
  const plugin = {};
  const stylelint = {
    // Do not cache for tests
    cache: false,
    configFile: join(testDir, ".stylelintrc"),
  };

  for (const [option, value] of Object.entries(pluginConf)) {
    if (PLUGIN_OPTIONS.includes(option)) {
      plugin[option] = value;
    } else {
      stylelint[option] = value;
    }
  }

  return {
    context: join(testDir, "fixtures", context),
    mode: "development",
    entry: "./index",
    output: {
      path: join(testDir, "outputs"),
    },
    plugins: [
      new LintPlugin({
        ...plugin,
        linters: [{ use: "stylelint", ...stylelint }],
      }),
    ],
    ...webpackConf,
  };
};
