import { join } from "node:path";

import LintPlugin from "../../../src";

export default (context, pluginConf = {}, webpackConf = {}) => {
  const testDir = join(import.meta.dirname, "..");

  return {
    context: join(testDir, "fixtures", context),
    mode: "development",
    entry: "./index",
    output: {
      path: join(testDir, "outputs"),
    },
    plugins: [new LintPlugin(pluginConf)],
    ...webpackConf,
  };
};
