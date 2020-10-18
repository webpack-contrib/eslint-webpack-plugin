import { isAbsolute, join } from 'path';

import arrify from 'arrify';
import micromatch from 'micromatch';

import { getOptions } from './options';
import linter from './linter';
import { parseFiles, parseFoldersToGlobs } from './utils';

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('./options').Options} Options */

const ESLINT_PLUGIN = 'ESLintWebpackPlugin';

class ESLintWebpackPlugin {
  /**
   * @param {Options} options
   */
  constructor(options = {}) {
    this.options = getOptions(options);
    this.run = this.run.bind(this);
  }

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler) {
    if (!this.options.lintDirtyModulesOnly) {
      compiler.hooks.run.tapPromise(ESLINT_PLUGIN, this.run);
    }

    // TODO: Figure out want `compiler.watching` is and how to use it in Webpack5.
    // From my testing of compiler.watch() ... compiler.watching is always
    // undefined (webpack 4 doesn't define it either) I'm leaving it out
    // for now.
    compiler.hooks.watchRun.tapPromise(ESLINT_PLUGIN, this.run);
  }

  /**
   * @param {Compiler} compiler
   */
  async run(compiler) {
    const options = {
      ...this.options,

      // @ts-ignore
      files: parseFiles(this.options.files, this.getContext(compiler)),
      extensions: arrify(this.options.extensions),
    };

    const wanted = parseFoldersToGlobs(options.files, options.extensions);
    /** @type {import('./linter').Linter} */
    let lint;
    /** @type {import('./linter').Reporter} */
    let report;

    try {
      ({ lint, report } = linter(options));
    } catch (e) {
      compiler.hooks.thisCompilation.tap(ESLINT_PLUGIN, (compilation) =>
        compilation.errors.push(e)
      );
      return;
    }

    /**
     * @param {import('webpack').compilation.Module} module
     */
    const processModule = (module) => {
      // @ts-ignore
      const file = module.resource;

      if (file && micromatch.isMatch(file, wanted)) {
        // Queue file for linting.
        lint(file);
      }
    };

    compiler.hooks.thisCompilation.tap(ESLINT_PLUGIN, (compilation) => {
      /** @type {import('./linter').ReportContent?} */
      let reportAsset = null;
      // Gather Files to lint
      compilation.hooks.succeedModule.tap(ESLINT_PLUGIN, processModule);
      // await and interpret results
      compilation.hooks.afterSeal.tapPromise(ESLINT_PLUGIN, processResults);

      async function processResults() {
        const { errors, warnings, generateReportAsset } = await report();

        if (warnings) {
          compilation.warnings.push(warnings);
        }

        if (errors) {
          compilation.errors.push(errors);
        }

        if (generateReportAsset) {
          reportAsset = await generateReportAsset(compilation);
        }
      }

      function saveReport() {
        if (reportAsset) {
          // @ts-ignore
          compilation.emitAsset(reportAsset.filename, reportAsset.source);
        }
      }

      // FIXME: This works... however, its not ideal?
      compiler.hooks.emit.tap(ESLINT_PLUGIN, saveReport);

      /*
       * TODO: from what I can gather, we want to emit the report asset in
       * processAssets (stage: report) and fallback to additionalChunkAssets
       * for webpack 4. However these hooks fire before `reportAsset` has
       * been computed (see processResults above)
       *

        // Webpack 5
        if (compiler.webpack && compilation.hooks.processAssets) {
          const { Compilation } = compiler.webpack;
          compilation.hooks.processAssets.tap(
            {
              name: ESLINT_PLUGIN,
              stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
            },
            saveReport
          );

          // Webpack 4
        } else {
          compilation.hooks.additionalChunkAssets.tap(
            ESLINT_PLUGIN,
            saveReport
          );
        }
        */
    });
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
