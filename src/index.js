import { isAbsolute, join } from 'path';

import arrify from 'arrify';

import { getOptions } from './options';
import DirtyFileWatcher from './DirtyFileWatcher';
import linter from './linter';
import { parseFiles } from './utils';

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('./options').Options} Options */

class ESLintWebpackPlugin {
  /**
   * @param {Options} options
   */
  constructor(options = {}) {
    this.options = getOptions(options);
  }

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler) {
    const options = {
      ...this.options,

      // @ts-ignore
      files: parseFiles(this.options.files, this.getContext(compiler)),
      extensions: arrify(this.options.extensions),
    };

    if (options.lintDirtyModulesOnly) {
      const dirtyFileWatcher = new DirtyFileWatcher(
        options.files,
        options.extensions
      );

      /* istanbul ignore next */
      compiler.hooks.watchRun.tapPromise(
        'ESLintWebpackPlugin',
        async (runCompiler) => {
          const files = dirtyFileWatcher.getDirtyFiles(
            runCompiler.fileTimestamps
          );

          if (files.length > 0) {
            await linter({ ...options, files }, runCompiler);
          }
        }
      );
    } else {
      compiler.hooks.run.tapPromise('ESLintWebpackPlugin', (runCompiler) => {
        return linter(options, runCompiler);
      });

      /* istanbul ignore next */
      compiler.hooks.watchRun.tapPromise(
        'ESLintWebpackPlugin',
        (runCompiler) => {
          return linter(options, runCompiler);
        }
      );
    }
  }

  /**
   *
   * @param {Compiler} compiler
   * @returns {string}
   */
  getContext(compiler) {
    if (!this.options.context) {
      return String(compiler.options.context);
    }

    if (!isAbsolute(this.options.context)) {
      return join(String(compiler.options.context), this.options.context);
    }

    return this.options.context;
  }
}

export default ESLintWebpackPlugin;
