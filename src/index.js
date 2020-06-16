import { isAbsolute, join } from 'path';

import arrify from 'arrify';

import { getOptions } from './options';
import DirtyFileWatcher from './DirtyFileWatcher';
import linter from './linter';

class ESLintWebpackPlugin {
  constructor(options = {}) {
    this.options = getOptions(options);
  }

  apply(compiler) {
    const context = this.getContext(compiler);
    const options = { ...this.options };

    options.files = arrify(options.files).map((file) =>
      join(context, '/', file)
    );

    const plugin = { name: this.constructor.name };

    if (options.lintDirtyModulesOnly) {
      const dirtyFileWatcher = new DirtyFileWatcher(options);

      /* istanbul ignore next */
      compiler.hooks.watchRun.tapPromise(plugin, async (runCompiler) => {
        const files = dirtyFileWatcher.getDirtyFiles(runCompiler);
        if (files.length > 0) {
          await linter({ ...options, files }, runCompiler);
        }
      });
    } else {
      compiler.hooks.run.tapPromise(plugin, (runCompiler) => {
        return linter(options, runCompiler);
      });

      /* istanbul ignore next */
      compiler.hooks.watchRun.tapPromise(plugin, (runCompiler) => {
        return linter(options, runCompiler);
      });
    }
  }

  getContext(compiler) {
    if (!this.options.context) {
      return compiler.options.context;
    }

    if (!isAbsolute(this.options.context)) {
      return join(compiler.options.context, this.options.context);
    }

    return this.options.context;
  }
}

export default ESLintWebpackPlugin;
