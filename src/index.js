import { isAbsolute, join } from 'path';

import arrify from 'arrify';
import micromatch from 'micromatch';

import { getOptions } from './options';
import linter from './linter';
import { parseFiles, parseFoldersToGlobs } from './utils';

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('./options').Options} Options */

const ESLINT_PLUGIN = 'ESLintWebpackPlugin';
let counter = 0;

export class ESLintWebpackPlugin {
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
    // Generate key for each compilation,
    // this differentiates one from the other when being cached.
    this.key = compiler.name || `${ESLINT_PLUGIN}_${(counter += 1)}`;

    // If `lintDirtyModulesOnly` is disabled,
    // execute the linter on the build
    if (!this.options.lintDirtyModulesOnly) {
      compiler.hooks.run.tapPromise(ESLINT_PLUGIN, this.run);
    }

    // TODO: Figure out want `compiler.watching` is and how to use it in Webpack5.
    // From my testing of compiler.watch() ... compiler.watching is always
    // undefined (webpack 4 doesn't define it either) I'm leaving it out
    // for now.
    let isFirstRun = this.options.lintDirtyModulesOnly;
    compiler.hooks.watchRun.tapPromise(ESLINT_PLUGIN, (c) => {
      if (isFirstRun) {
        isFirstRun = false;

        return Promise.resolve();
      }

      return this.run(c);
    });
  }

  /**
   * @param {Compiler} compiler
   */
  async run(compiler) {
    // Do not re-hook
    if (
      // @ts-ignore
      compiler.hooks.thisCompilation.taps.find(
        // @ts-ignore
        ({ name }) => name === ESLINT_PLUGIN
      )
    ) {
      return;
    }

    const options = {
      ...this.options,
      exclude: parseFiles(
        this.options.exclude || 'node_modules',
        this.getContext(compiler)
      ),
      extensions: arrify(this.options.extensions),
      files: parseFiles(this.options.files || '', this.getContext(compiler)),
    };

    const wanted = parseFoldersToGlobs(options.files, options.extensions);
    const exclude = parseFoldersToGlobs(options.exclude, []);

    compiler.hooks.thisCompilation.tap(ESLINT_PLUGIN, (compilation) => {
      /** @type {import('./linter').Linter} */
      let lint;
      /** @type {import('./linter').Reporter} */
      let report;

      try {
        ({ lint, report } = linter(this.key, options, compilation));
      } catch (e) {
        compilation.errors.push(e);
        return;
      }

      // @ts-ignore
      const processModule = (module) => {
        if (module.resource) {
          const [file] = module.resource.split('?');

          if (
            file &&
            micromatch.isMatch(file, wanted) &&
            !micromatch.isMatch(file, exclude)
          ) {
            // Queue file for linting.
            lint(file);
          }
        }
      };

      // Gather Files to lint
      compilation.hooks.succeedModule.tap(ESLINT_PLUGIN, processModule);

      // await and interpret results
      compilation.compiler.hooks.emit.tapPromise(ESLINT_PLUGIN, processResults);

      async function processResults() {
        const { errors, warnings, generateReportAsset } = await report();

        if (warnings) {
          // @ts-ignore
          compilation.warnings.push(warnings);
        }

        if (errors) {
          // @ts-ignore
          compilation.errors.push(errors);
        }

        if (generateReportAsset) {
          await generateReportAsset(compilation);
        }
      }
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
