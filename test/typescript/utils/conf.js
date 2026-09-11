import { join } from "node:path";

import DiagnosticsPlugin from "../../../src/index.js";

// Options the plugin only accepts next to the check entries, not inside one.
const PLUGIN_OPTIONS = ["context", "lintOnStart", "threads"];

export default (context, pluginConf = {}, webpackConf = {}) => {
  const testDir = join(import.meta.dirname, "..");
  const plugin = {};
  const typescript = {};

  for (const [option, value] of Object.entries(pluginConf)) {
    if (PLUGIN_OPTIONS.includes(option)) {
      plugin[option] = value;
    } else {
      typescript[option] = value;
    }
  }

  return {
    context: join(testDir, "fixtures", context),
    mode: "development",
    entry: "./index",
    output: { path: join(testDir, "outputs") },
    plugins: [
      new DiagnosticsPlugin({
        ...plugin,
        checks: [{ use: "typescript", ...typescript }],
      }),
    ],
    ...webpackConf,
  };
};
