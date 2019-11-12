import { isAbsolute, join } from 'path';

import { writeFileSync, ensureFileSync } from 'fs-extra';

import ESLintError from './ESLintError';

export default function linter(options, compiler, callback) {
  try {
    const { CLIEngine } = require(options.eslintPath);
    const cli = new CLIEngine(options);
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

    let { errors, warnings } = parseResults(options, results);

    compiler.hooks.afterCompile.tapAsync(
      'ESLintWebpackPlugin',
      (compilation, next) => {
        if (warnings.length > 0) {
          compilation.warnings.push(
            new ESLintError(options.formatter(warnings))
          );
          warnings = [];
        }

        if (errors.length > 0) {
          compilation.errors.push(new ESLintError(options.formatter(errors)));
          errors = [];
        }

        next();
      }
    );

    compiler.hooks.emit.tapAsync('ESLintWebpackPlugin', (compilation, next) => {
      const { outputReport } = options;

      if (!outputReport || !outputReport.filePath) {
        next();
        return;
      }

      const content = outputReport.formatter
        ? outputReport.formatter(results)
        : options.formatter(results);

      let { filePath } = outputReport;

      if (!isAbsolute(filePath)) {
        filePath = join(compilation.compiler.outputPath, filePath);
      }

      ensureFileSync(filePath);
      writeFileSync(filePath, content);

      next();
    });

    if (options.failOnError && errors.length > 0) {
      callback(new ESLintError(options.formatter(errors)));
    } else if (options.failOnWarning && warnings.length > 0) {
      callback(new ESLintError(options.formatter(warnings)));
    } else {
      callback();
    }
  } catch (e) {
    callback(e);
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
