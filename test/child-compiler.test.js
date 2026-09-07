import assert from "node:assert/strict";
import { describe, it } from "node:test";

import webpack from "webpack";

import conf from "./utils/conf.js";

const PLUGIN_NAME = "ChildPlugin";
class ChildPlugin {
  constructor(options) {
    this.options = webpack.config.getNormalizedWebpackOptions(options);
  }

  apply(compiler) {
    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const childCompiler = compilation.createChildCompiler(PLUGIN_NAME);
      webpack.EntryOptionPlugin.applyEntryOption(
        childCompiler,
        compilation.compiler.context,
        this.options.entry,
      );
      childCompiler.runAsChild(() => {
        callback();
      });
    });
  }
}

describe("child compiler", () => {
  it("should have linting process", (t, done) => {
    const config = conf("good");
    config.plugins.push(
      new ChildPlugin({
        entry: {
          child: "./child-entry",
        },
      }),
    );
    webpack(config).run((err, stats) => {
      assert.strictEqual(err, null);
      assert.strictEqual(stats.hasErrors(), false);
      assert.strictEqual(stats.hasWarnings(), true);
      done();
    });
  });
});
