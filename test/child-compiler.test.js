import webpack from 'webpack';

import conf from './utils/conf';

const PLUGIN_NAME = 'ChildPlugin';
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

describe('child compiler', () => {
  it('should have linting process', (done) => {
    const config = conf('good', { threads: false });
    config.plugins.push(
      new ChildPlugin({
        entry: {
          child: './child-entry',
        },
      }),
    );
    webpack(config).run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBe(false);
      expect(stats.hasWarnings()).toBe(true);
      done();
    });
  });
});
