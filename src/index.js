import { isAbsolute, join } from "node:path";

import picomatch from "picomatch";
import { globSync } from "tinyglobby";

import createCheckRunner from "./check.js";
import { getOptions, reportedAs, validateOptions } from "./options.js";
import {
  arrify,
  parseFiles,
  parseFoldersToGlobs,
  writeOutputFile,
} from "./utils.js";

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
 * @property {"modules" | "glob"} filesSource where the check's files come from
 * @property {(file: string) => boolean} isWanted whether a path is one to lint
 * @property {(file: string) => boolean} isExcluded whether a path is left out
 */

const LINT_PLUGIN = "DiagnosticsWebpackPlugin";

// How many files webpack has to have built before a check is handed any of
// them, rather than all of them once the graph is done.
const EARLY_BATCH = 64;

let compilerId = 0;

/**
 * @param {Compiler} compiler compiler
 * @param {ResolvedCheck} check the check to collect the files of
 * @returns {string[]} the files on disk to lint
 */
function collectFromFileSystem(compiler, { wanted, exclude, ...check }) {
  if (!compiler.modifiedFiles) {
    return globSync(wanted, { absolute: true, dot: true, ignore: exclude });
  }

  return [...compiler.modifiedFiles].filter(
    (file) => check.isWanted(file) && !check.isExcluded(file),
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

    // A build is nothing but a first compilation, so `lintOnStart` cannot
    // silence one without silencing the plugin.
    compiler.hooks.run.tapPromise(this.key, (compiler) =>
      this.run(compiler, getChecks()),
    );

    // A lint integration whose bundler reaches a file only once something
    // requests it defaults this off; webpack's first build walks all of them.
    let skipping = !this.options.lintOnStart;

    compiler.hooks.watchRun.tapPromise(this.key, (compiler) => {
      if (skipping) {
        skipping = false;

        return Promise.resolve();
      }

      return this.run(compiler, getChecks());
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
      exclude: options.exclude
        ? parseFiles(options.exclude, context)
        : adapter.defaultExclude(compiler),
      extensions: arrify(options.extensions),
      include: parseFiles(options.include || "", context),
      resourceQueryExclude: resourceQueries.map(
        (/** @type {RegExp | string} */ item) =>
          item instanceof RegExp ? item : new RegExp(item),
      ),
    };

    const wanted = parseFoldersToGlobs(
      /** @type {string[]} */ (resolved.include),
      resolved.extensions,
    );
    const exclude = parseFoldersToGlobs(
      /** @type {string[]} */ (resolved.exclude),
    );

    return {
      name,
      adapter,
      options: resolved,
      // A check told which files to check looks at all of them, whether or not
      // webpack built them, whatever the check reads by itself.
      filesSource: options.include ? "glob" : adapter.filesSource,
      wanted,
      exclude,
      // Compiled here rather than per call: the two run on every module of
      // every build, and matching by pattern recompiles them each time.
      isWanted: picomatch(wanted, { dot: true }),
      isExcluded: picomatch(exclude, { dot: true }),
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
        ? checks.filter((check) => check.filesSource === "modules")
        : checks;

      if (enabled.length === 0) return;

      const runners = enabled.map((check) => {
        const runner = this.createRunner(check, compilation);
        /** @type {string[]} */
        const pending = [];
        /** @type {string[]} */
        const kept = [];
        let scheduled = false;

        // Linting starts while webpack is still building rather than after
        // it. A batch below the threshold waits for the end of the graph: a
        // check that parallelises its own work, as ESLint does under
        // `concurrency`, has nothing to spread across workers before then.
        const flush = (atEnd = false) => {
          if (!atEnd) {
            if (scheduled || pending.length < EARLY_BATCH) return;

            scheduled = true;
            setImmediate(() => flush(true));

            return;
          }

          scheduled = false;

          if (pending.length > 0) runner.lint(pending.splice(0));
          if (kept.length > 0) runner.keep(kept.splice(0));
        };

        return {
          ...check,
          // Asked of every module of every build, so a set rather than a scan.
          /** @type {Set<string>} */
          seen: new Set(),
          pending,
          kept,
          flush,
          runner,
        };
      });

      const fromModules = runners.filter(
        (check) => check.filesSource === "modules",
      );

      if (fromModules.length > 0) {
        /**
         * @param {Module} module module
         * @param {boolean} rebuilt whether webpack built the module this time
         */
        const addFile = (module, rebuilt) => {
          const { resource } = /** @type {NormalModule} */ (module);

          if (!resource) return;

          const [file, query] = resource.split("?");

          if (!file) return;

          for (const check of fromModules) {
            const { options, seen } = check;
            const isFileNotListed = !seen.has(file);
            const isFileWanted =
              check.isWanted(file) && !check.isExcluded(file);
            const isQueryNotExclude = /** @type {RegExp[]} */ (
              options.resourceQueryExclude
            ).every((reg) => !reg.test(query));

            if (isFileNotListed && isFileWanted && isQueryNotExclude) {
              seen.add(file);
              (rebuilt ? check.pending : check.kept).push(file);
              check.flush();
            }
          }
        };

        compilation.hooks.succeedModule.tap(this.key, (module) =>
          addFile(module, true),
        );

        // A module webpack did not rebuild is reported from the last run.
        if (this.options.lintOnStart) {
          compilation.hooks.stillValidModule.tap(this.key, (module) =>
            addFile(module, false),
          );
        }
      }

      // Nothing globbed from the file system waits on the module graph.
      for (const check of runners) {
        if (check.filesSource === "modules") continue;

        const files = collectFromFileSystem(compiler, check);

        if (files.length > 0) check.runner.lint(files);

        // A rebuild is told what changed rather than what exists, so the rest
        // of what the walk found last time is reported from there.
        if (compiler.modifiedFiles) {
          check.runner.keepKnown(compiler.removedFiles || new Set());
        }
      }

      compilation.hooks.finishModules.tap(this.key, () => {
        for (const check of fromModules) check.flush(true);
      });

      // await and interpret results
      compilation.hooks.processAssets.tapAsync(
        this.key,
        async (_, callback) => {
          /** @type {Map<string, string[]>} */
          const outputReports = new Map();

          for (const { options, runner } of runners) {
            const { errors, warnings, outputReport } = await runner.report();

            // `reportAs` has already dropped whatever it reports as `false`,
            // so what is left only needs putting where it belongs.
            for (const [results, reported] of /** @type {const} */ ([
              ["errors", errors],
              ["warnings", warnings],
            ])) {
              if (!reported) continue;

              const severity = reportedAs(options.reportAs, results);

              (severity === "error"
                ? compilation.errors
                : compilation.warnings
              ).push(reported);
            }

            if (outputReport) {
              const contents = outputReports.get(outputReport.filePath) || [];

              contents.push(outputReport.content);
              outputReports.set(outputReport.filePath, contents);
            }
          }

          await Promise.all(
            [...outputReports].map(([filePath, contents]) =>
              writeOutputFile(compiler, filePath, contents.join("\n")),
            ),
          );

          callback();
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
