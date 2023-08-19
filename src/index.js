const { isAbsolute, join } = require('path');

const { isMatch } = require('micromatch');

const { getOptions } = require('./options');
const linter = require('./linter');
const { arrify, parseFiles, parseFoldersToGlobs } = require('./utils');

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('webpack').Module} Module */
/** @typedef {import('webpack').NormalModule} NormalModule */
/** @typedef {import('./options').Options} Options */
/** @typedef {import('./linter').File} File */

const ESLINT_PLUGIN = 'ESLintWebpackPlugin';
const DEFAULT_FOLDER_TO_EXCLUDE = '**/node_modules/**';

let compilerId = 0;

class ESLintWebpackPlugin {
  /**
   * @param {Options} options
   */
  constructor(options = {}) {
    this.key = ESLINT_PLUGIN;
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
    this.key = compiler.name || `${this.key}_${(compilerId += 1)}`;

    const excludedFiles = parseFiles(
      this.options.exclude || [],
      this.getContext(compiler)
    );
    const resourceQueries = arrify(this.options.resourceQueryExclude);
    const excludedResourceQueries = resourceQueries.map((item) =>
      item instanceof RegExp ? item : new RegExp(item)
    );

    const options = {
      ...this.options,
      exclude: excludedFiles,
      resourceQueryExclude: excludedResourceQueries,
      extensions: arrify(this.options.extensions),
      files: parseFiles(this.options.files || '', this.getContext(compiler)),
    };

    const foldersToExclude = this.options.exclude
      ? options.exclude
      : DEFAULT_FOLDER_TO_EXCLUDE;
    const exclude = parseFoldersToGlobs(foldersToExclude);
    const wanted = parseFoldersToGlobs(options.files, options.extensions);

    // If `lintDirtyModulesOnly` is disabled,
    // execute the linter on the build
    if (!this.options.lintDirtyModulesOnly) {
      compiler.hooks.run.tapPromise(this.key, (c) =>
        this.run(c, options, wanted, exclude)
      );
    }

    let hasCompilerRunByDirtyModule = this.options.lintDirtyModulesOnly;

    compiler.hooks.watchRun.tapPromise(this.key, (c) => {
      if (!hasCompilerRunByDirtyModule)
        return this.run(c, options, wanted, exclude);

      hasCompilerRunByDirtyModule = false;

      return Promise.resolve();
    });
  }

  /**
   * @param {Compiler} compiler
   * @param {Omit<Options, 'resourceQueryExclude'> & {resourceQueryExclude: RegExp[]}} options
   * @param {string[]} wanted
   * @param {string[]} exclude
   */
  async run(compiler, options, wanted, exclude) {
    // @ts-ignore
    const isCompilerHooked = compiler.hooks.compilation.taps.find(
      ({ name }) => name === this.key
    );

    if (isCompilerHooked) return;

    compiler.hooks.compilation.tap(this.key, (compilation) => {
      /** @type {import('./linter').Linter} */
      let lint;
      /** @type {import('./linter').Reporter} */
      let report;
      /** @type number */
      let threads;

      try {
        ({ lint, report, threads } = linter(this.key, options, compilation));
      } catch (e) {
        compilation.errors.push(e);
        return;
      }

      /** @type {File[]} */
      const files = [];

      // Add the file to be linted
      compilation.hooks.succeedModule.tap(this.key, addFile);
      compilation.hooks.stillValidModule.tap(this.key, addFile);

      /**
       * @param {Module} module
       */
      function addFile(module) {
        const { resource } = /** @type {NormalModule} */ (module);

        if (!resource) return;

        const [filePath, query] = resource.split('?');
        const isFileNotListed =
          filePath && !files.map((file) => file.path).includes(filePath);
        const isFileWanted =
          isMatch(filePath, wanted, { dot: true }) &&
          !isMatch(filePath, exclude, { dot: true });
        const isQueryNotExclude = options.resourceQueryExclude.every(
          (reg) => !reg.test(query)
        );

        if (isFileNotListed && isFileWanted && isQueryNotExclude) {
          // istanbul ignore next
          const content = String(
            (module.originalSource
              ? module.originalSource()
              : // eslint-disable-next-line line-comment-position
                // @ts-ignore
                // eslint-disable-next-line no-underscore-dangle
                module._source
            ).source()
          );
          const file = { path: filePath, content };
          files.push(file);

          if (threads > 1) lint([file]);
        }
      }

      // Lint all files added
      compilation.hooks.finishModules.tap(this.key, () => {
        if (files.length > 0 && threads <= 1) lint(files);
      });

      // await and interpret results
      compilation.hooks.additionalAssets.tapPromise(this.key, processResults);

      async function processResults() {
        const { errors, warnings, generateReportAsset } = await report();

        if (warnings && !options.failOnWarning) {
          // @ts-ignore
          compilation.warnings.push(warnings);
        } else if (warnings) {
          // @ts-ignore
          compilation.errors.push(warnings);
        }

        if (errors && !options.failOnError) {
          // @ts-ignore
          compilation.warnings.push(errors);
        } else if (errors) {
          // @ts-ignore
          compilation.errors.push(errors);
        }

        if (generateReportAsset) await generateReportAsset(compilation);
      }
    });
  }

  /**
   *
   * @param {Compiler} compiler
   * @returns {string}
   */
  getContext(compiler) {
    const compilerContext = String(compiler.options.context);
    const optionContext = this.options.context;

    if (!optionContext) return compilerContext;

    if (isAbsolute(optionContext)) return optionContext;

    return join(compilerContext, optionContext);
  }
}

module.exports = ESLintWebpackPlugin;
