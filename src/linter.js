import { isAbsolute, join } from 'path';

import { writeFileSync, ensureFileSync } from 'fs-extra';

import ESLintError from './ESLintError';
import getCLIEngine from './getCLIEngine';

export default async function linter(options, compiler, callback) {
  try {
    const { CLIEngine, cli } = getCLIEngine(options);
    const report = cli.executeOnFiles(options.files);

    // filter ignored files
    const results = report.results.filter(
      (result) => !cli.isPathIgnored(result.filePath)
    );

    // do not analyze if there are no results or eslint config
    if (!results || results.length < 1) {
      callback();
      return;
    }

    // if enabled, use eslint autofixing where possible
    if (options.fix) {
      CLIEngine.outputFixes(report);
    }

    // skip if no errors or warnings
    if (report.errorCount < 1 && report.warningCount < 1) {
      callback();
      return;
    }

    const formatter = await loadFormatter(cli, options.formatter);
    let { errors, warnings } = parseResults(options, results);

    compiler.hooks.afterEmit.tapAsync(
      'ESLintWebpackPlugin',
      (compilation, next) => {
        if (warnings.length > 0) {
          compilation.warnings.push(new ESLintError(formatter(warnings)));
          warnings = [];
        }

        if (errors.length > 0) {
          compilation.errors.push(new ESLintError(formatter(errors)));
          errors = [];
        }

        next();
      }
    );

    compiler.hooks.emit.tapAsync(
      'ESLintWebpackPlugin',
      async (compilation, next) => {
        const { outputReport } = options;

        if (!outputReport || !outputReport.filePath) {
          next();
          return;
        }

        const content = outputReport.formatter
          ? (await loadFormatter(cli, outputReport.formatter))(results)
          : formatter(results);

        let { filePath } = outputReport;

        if (!isAbsolute(filePath)) {
          filePath = join(compilation.compiler.outputPath, filePath);
        }

        ensureFileSync(filePath);
        writeFileSync(filePath, content);

        next();
      }
    );

    if (options.failOnError && errors.length > 0) {
      callback(new ESLintError(formatter(errors)));
    } else if (options.failOnWarning && warnings.length > 0) {
      callback(new ESLintError(formatter(warnings)));
    } else {
      callback();
    }
  } catch (e) {
    compiler.hooks.afterEmit.tapAsync(
      'ESLintWebpackPlugin',
      (compilation, next) => {
        compilation.errors.push(new ESLintError(e.message));
        next();
      }
    );

    callback();
  }
}

function parseResults(options, results) {
  let errors = [];
  let warnings = [];

  if (options.emitError) {
    errors = results.filter(
      (file) => fileHasErrors(file) || fileHasWarnings(file)
    );
  } else if (options.emitWarning) {
    warnings = results.filter(
      (file) => fileHasErrors(file) || fileHasWarnings(file)
    );
  } else {
    warnings = results.filter(
      (file) => !fileHasErrors(file) && fileHasWarnings(file)
    );
    errors = results.filter(fileHasErrors);
  }

  if (options.quiet && warnings.length > 0) {
    warnings = [];
  }

  return {
    errors,
    warnings,
  };
}

function fileHasErrors(file) {
  return file.errorCount > 0;
}

function fileHasWarnings(file) {
  return file.warningCount > 0;
}

async function loadFormatter(cli, formatter) {
  if (typeof formatter === 'function') {
    return formatter;
  }

  if (typeof formatter === 'string') {
    try {
      return cli.getFormatter(formatter);
    } catch (_) {
      // Load the default formatter.
    }
  }

  return cli.getFormatter();
}
