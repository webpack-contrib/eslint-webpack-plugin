const { isAbsolute, join } = require("node:path");

const { isMatch } = require("micromatch");

const linter = require("./linter");
const { getOptions } = require("./options");
const { arrify, parseFiles, parseFoldersToGlobs } = require("./utils");

/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Module} Module */
/** @typedef {import("webpack").NormalModule} NormalModule */
/** @typedef {import("./options").Options} Options */

const ESLINT_PLUGIN = "ESLintWebpackPlugin";
const DEFAULT_FOLDER_TO_EXCLUDE = "**/node_modules/**";

let compilerId = 0;

class ESLintWebpackPlugin {
  /**
   * @param {Options=} options options
   */
  constructor(options = {}) {
    this.key = ESLINT_PLUGIN;
    this.options = getOptions(options);
    this.run = this.run.bind(this);
  }

  /**
   * @param {Compiler} compiler compiler
   * @returns {void}
   */
  apply(compiler) {
    // Generate key for each compilation,
    // this differentiates one from the other when being cached.
    this.key = compiler.name || `${this.key}_${(compilerId += 1)}`;
    this.options.failOnError ??= compiler.options.mode !== "development";

    const excludedFiles = parseFiles(
      this.options.exclude || [],
      this.getContext(compiler),
    );
    const resourceQueries = arrify(this.options.resourceQueryExclude || []);
    const excludedResourceQueries = resourceQueries.map((item) =>
      item instanceof RegExp ? item : new RegExp(item),
    );

    const options = {
      ...this.options,
      exclude: excludedFiles,
      resourceQueryExclude: excludedResourceQueries,
      extensions: arrify(this.options.extensions),
      files: parseFiles(this.options.files || "", this.getContext(compiler)),
    };

    const foldersToExclude = this.options.exclude
      ? options.exclude
      : DEFAULT_FOLDER_TO_EXCLUDE;
    const exclude = parseFoldersToGlobs(foldersToExclude);
    const wanted = parseFoldersToGlobs(options.files, options.extensions);

    // If `lintDirtyModulesOnly` is disabled,
    // execute the linter on the build
    if (!this.options.lintDirtyModulesOnly) {
      compiler.hooks.run.tapPromise(this.key, (compiler) =>
        this.run(compiler, options, wanted, exclude),
      );
    }

    let hasCompilerRunByDirtyModule = this.options.lintDirtyModulesOnly;

    compiler.hooks.watchRun.tapPromise(this.key, (compiler) => {
      if (!hasCompilerRunByDirtyModule) {
        return this.run(compiler, options, wanted, exclude);
      }

      hasCompilerRunByDirtyModule = false;

      return Promise.resolve();
    });
  }

  /**
   * @param {Compiler} compiler compiler
   * @param {Omit<Options, "resourceQueryExclude"> & { resourceQueryExclude: RegExp[] }} options options
   * @param {string[]} wanted wanted files
   * @param {string[]} exclude excluded files
   */
  async run(compiler, options, wanted, exclude) {
    // Do not re-hook
    const isCompilerHooked = compiler.hooks.compilation.taps.find(
      ({ name }) => name === this.key,
    );

    if (isCompilerHooked) return;

    compiler.hooks.compilation.tap(this.key, async (compilation) => {
      /** @type {import("./linter").Linter} */
      let lint;
      /** @type {import("./linter").Reporter} */
      let report;

      try {
        ({ lint, report } = await linter(options, compilation));
      } catch (err) {
        compilation.errors.push(err);
        return;
      }

      /** @type {string[]} */
      const files = [];

      /**
       * @param {Module} module module
       */
      function addFile(module) {
        const { resource } = /** @type {NormalModule} */ (module);

        if (!resource) return;

        const [file, query] = resource.split("?");
        const isFileNotListed = file && !files.includes(file);
        const isFileWanted =
          isMatch(file, wanted, { dot: true }) &&
          !isMatch(file, exclude, { dot: true });
        const isQueryNotExclude = options.resourceQueryExclude.every(
          (reg) => !reg.test(query),
        );

        if (isFileNotListed && isFileWanted && isQueryNotExclude) {
          files.push(file);
        }
      }

      // Add the file to be linted
      compilation.hooks.succeedModule.tap(this.key, addFile);

      if (!this.options.lintDirtyModulesOnly) {
        compilation.hooks.stillValidModule.tap(this.key, addFile);
      }

      // Lint all files added
      compilation.hooks.finishModules.tap(this.key, () => {
        if (files.length > 0) lint(files);
      });

      // await and interpret results
      compilation.hooks.processAssets.tapAsync(
        this.key,
        async (_, callback) => {
          const { errors, warnings, generateReportAsset } = await report();

          if (warnings) {
            compilation.warnings.push(warnings);
          }

          if (errors) {
            compilation.errors.push(errors);
          }

          if (generateReportAsset) {
            await generateReportAsset(compilation);
          }

          if (warnings && options.failOnWarning) {
            callback(warnings);
          } else if (errors && options.failOnError) {
            callback(errors);
          } else {
            callback();
          }
        },
      );
    });
  }

  /**
   * @param {Compiler} compiler compiler
   * @returns {string} context
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
