import { isAbsolute, join } from "node:path";

import globby from "globby";
import micromatch from "micromatch";

import createCheckRunner from "./check.js";
import { getOptions, validateOptions } from "./options.js";
import {
  arrify,
  parseFiles,
  parseFoldersToGlobs,
  writeOutputFile,
} from "./utils.js";

// `micromatch` is CommonJS, whose named exports ESM cannot always see
const { isMatch } = micromatch;

/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Module} Module */
/** @typedef {import("webpack").NormalModule} NormalModule */
/** @typedef {import("./check.js").Runner} Runner */
/** @typedef {import("./checks/index.js").CheckAdapter} CheckAdapter */
/** @typedef {import("./options.js").EnabledCheck} EnabledCheck */
/** @typedef {import("./options.js").CheckOptions} CheckOptions */
/** @typedef {import("./options.js").Options} Options */

/**
 * @typedef {object} ResolvedCheck
 * @property {string} name check name
 * @property {CheckAdapter} adapter the adapter running it
 * @property {CheckOptions} options options resolved for this check
 * @property {string[]} wanted the globs of the files to lint
 * @property {string[]} exclude the globs of the files not to lint
 */

const LINT_PLUGIN = "DiagnosticsWebpackPlugin";

let compilerId = 0;

/**
 * @param {Compiler} compiler compiler
 * @param {string[]} wanted the globs of the files to lint
 * @param {string[]} exclude the globs of the files not to lint
 * @returns {string[]} the files on disk to lint
 */
function collectFromFileSystem(compiler, wanted, exclude) {
  if (!compiler.modifiedFiles) {
    return globby.sync(wanted, { dot: true, ignore: exclude });
  }

  return [...compiler.modifiedFiles].filter(
    (file) =>
      isMatch(file, wanted, { dot: true }) &&
      !isMatch(file, exclude, { dot: true }),
  );
}

class DiagnosticsWebpackPlugin {
  /**
   * @param {Options} options options
   */
  constructor(options = /** @type {Options} */ ({})) {
    this.key = LINT_PLUGIN;
    this.given = options;
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

    const validateGiven = () => {
      validateOptions(compiler, this.given, this.options.checks);
    };

    // The hook, and webpack's `validate: false` with it, arrived in 5.106.
    if (compiler.hooks.validate) {
      compiler.hooks.validate.tap(this.key, validateGiven);
    } else {
      validateGiven();
    }

    /** @type {ResolvedCheck[] | undefined} */
    let checks;

    // Resolved on the first build rather than here, so that an option the
    // schema rejects is reported by the hook above and not by this.
    const getChecks = () => {
      if (!checks) {
        const context = this.getContext(compiler);

        checks = this.options.checks.map((check) =>
          this.resolveCheck(compiler, context, check),
        );
      }

      return checks;
    };

    // If `lintDirtyModulesOnly` is disabled,
    // execute the checks on the build
    if (!this.options.lintDirtyModulesOnly) {
      compiler.hooks.run.tapPromise(this.key, (compiler) =>
        this.run(compiler, getChecks()),
      );
    }

    let hasCompilerRunByDirtyModule = this.options.lintDirtyModulesOnly;

    compiler.hooks.watchRun.tapPromise(this.key, (compiler) => {
      if (!hasCompilerRunByDirtyModule) {
        return this.run(compiler, getChecks());
      }

      hasCompilerRunByDirtyModule = false;

      return Promise.resolve();
    });
  }

  /**
   * @param {Compiler} compiler compiler
   * @param {string} context context
   * @param {EnabledCheck} check the check to resolve the globs of
   * @returns {ResolvedCheck} the check with its globs resolved
   */
  resolveCheck(compiler, context, { name, adapter, options }) {
    const resourceQueries = arrify(options.resourceQueryExclude || []);

    /** @type {CheckOptions} */
    const resolved = {
      ...options,
      context,
      failOnError:
        options.failOnError ?? compiler.options.mode !== "development",
      exclude: options.exclude
        ? parseFiles(options.exclude, context)
        : adapter.defaultExclude(compiler),
      extensions: arrify(options.extensions),
      files: parseFiles(options.files || "", context),
      resourceQueryExclude: resourceQueries.map(
        (/** @type {RegExp | string} */ item) =>
          item instanceof RegExp ? item : new RegExp(item),
      ),
    };

    return {
      name,
      adapter,
      options: resolved,
      wanted: parseFoldersToGlobs(
        /** @type {string[]} */ (resolved.files),
        resolved.extensions,
      ),
      exclude: parseFoldersToGlobs(/** @type {string[]} */ (resolved.exclude)),
    };
  }

  /**
   * @param {Compiler} compiler compiler
   * @param {ResolvedCheck[]} checks the checks to run
   */
  async run(compiler, checks) {
    // Do not re-hook
    const isCompilerHooked = compiler.hooks.compilation.taps.find(
      ({ name }) => name === this.key,
    );

    if (isCompilerHooked) return;

    compiler.hooks.compilation.tap(this.key, (compilation) => {
      // Globbing the file system does not depend on the module graph, so a
      // child compilation would only lint what its parent already did.
      const enabled = compilation.compiler.isChild()
        ? checks.filter(({ adapter }) => adapter.filesSource === "modules")
        : checks;

      if (enabled.length === 0) return;

      const runners = enabled.map((check) => ({
        ...check,
        /** @type {string[]} */
        files: [],
        runner: this.createRunner(check, compilation),
      }));

      const fromModules = runners.filter(
        ({ adapter }) => adapter.filesSource === "modules",
      );

      if (fromModules.length > 0) {
        /**
         * @param {Module} module module
         */
        const addFile = (module) => {
          const { resource } = /** @type {NormalModule} */ (module);

          if (!resource) return;

          const [file, query] = resource.split("?");

          if (!file) return;

          for (const { files, wanted, exclude, options } of fromModules) {
            const isFileNotListed = !files.includes(file);
            const isFileWanted =
              isMatch(file, wanted, { dot: true }) &&
              !isMatch(file, exclude, { dot: true });
            const isQueryNotExclude = /** @type {RegExp[]} */ (
              options.resourceQueryExclude
            ).every((reg) => !reg.test(query));

            if (isFileNotListed && isFileWanted && isQueryNotExclude) {
              files.push(file);
            }
          }
        };

        // Add the file to be linted
        compilation.hooks.succeedModule.tap(this.key, addFile);

        if (!this.options.lintDirtyModulesOnly) {
          compilation.hooks.stillValidModule.tap(this.key, addFile);
        }
      }

      // Lint all files added
      compilation.hooks.finishModules.tap(this.key, () => {
        for (const { adapter, files, wanted, exclude, runner } of runners) {
          const filesToLint =
            adapter.filesSource === "modules"
              ? files
              : collectFromFileSystem(compiler, wanted, exclude);

          if (filesToLint.length > 0) runner.lint(filesToLint);
        }
      });

      // await and interpret results
      compilation.hooks.processAssets.tapAsync(
        this.key,
        async (_, callback) => {
          /** @type {Map<string, string[]>} */
          const outputReports = new Map();
          /** @type {Error | undefined} */
          let failure;

          for (const { options, runner } of runners) {
            const { errors, warnings, outputReport } = await runner.report();

            if (warnings) {
              compilation.warnings.push(warnings);
            }

            if (errors) {
              compilation.errors.push(errors);
            }

            if (outputReport) {
              const contents = outputReports.get(outputReport.filePath) || [];

              contents.push(outputReport.content);
              outputReports.set(outputReport.filePath, contents);
            }

            if (!failure) {
              if (warnings && options.failOnWarning) {
                failure = warnings;
              } else if (errors && options.failOnError) {
                failure = errors;
              }
            }
          }

          await Promise.all(
            [...outputReports].map(([filePath, contents]) =>
              writeOutputFile(compiler, filePath, contents.join("\n")),
            ),
          );

          callback(failure);
        },
      );
    });
  }

  /**
   * @param {ResolvedCheck} check the check to create a runner for
   * @param {Compilation} compilation compilation
   * @returns {Runner} runner
   */
  createRunner({ name, adapter, options }, compilation) {
    return createCheckRunner(this.key, { name, adapter, options }, compilation);
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

export default DiagnosticsWebpackPlugin;
