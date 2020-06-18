import { isAbsolute, join } from 'path';

import { writeFileSync, ensureFileSync } from 'fs-extra';

import ESLintError from './ESLintError';
import getESLint from './getESLint';

export default async function linter(options, compiler) {
  let ESLint;
  let eslint;
  let rawResults = [];
  try {
    ({ ESLint, eslint } = getESLint(options));
    rawResults = await eslint.lintFiles(options.files);
  } catch (e) {
    compiler.hooks.afterEmit.tapPromise(
      'ESLintWebpackPlugin',
      async (compilation) => {
        compilation.errors.push(new ESLintError(e.message));
      }
    );
    return;
  }

  // Filter out ignored files.
  const results = await removeIgnoredWarnings(rawResults, eslint);

  // do not analyze if there are no results or eslint config
  if (!results || results.length < 1) {
    return;
  }

  // if enabled, use eslint autofixing where possible
  if (options.fix) {
    await ESLint.outputFixes(results);
  }

  const formatter = await loadFormatter(eslint, options.formatter);
  let { errors, warnings } = parseResults(options, results);

  compiler.hooks.afterEmit.tapPromise(
    'ESLintWebpackPlugin',
    async (compilation) => {
      if (warnings.length > 0) {
        compilation.warnings.push(new ESLintError(formatter.format(warnings)));
        warnings = [];
      }

      if (errors.length > 0) {
        compilation.errors.push(new ESLintError(formatter.format(errors)));
        errors = [];
      }
    }
  );

  compiler.hooks.emit.tapPromise('ESLintWebpackPlugin', async (compilation) => {
    const { outputReport } = options;

    if (!outputReport || !outputReport.filePath) {
      return;
    }

    const content = outputReport.formatter
      ? (await loadFormatter(eslint, outputReport.formatter)).format(results)
      : formatter.format(results);

    let { filePath } = outputReport;

    if (!isAbsolute(filePath)) {
      filePath = join(compilation.compiler.outputPath, filePath);
    }

    ensureFileSync(filePath);
    writeFileSync(filePath, content);
  });

  if (options.failOnError && errors.length > 0) {
    throw new ESLintError(formatter.format(errors));
  } else if (options.failOnWarning && warnings.length > 0) {
    throw new ESLintError(formatter.format(warnings));
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

async function loadFormatter(eslint, formatter) {
  if (typeof formatter === 'function') {
    return { format: formatter };
  }

  if (typeof formatter === 'string') {
    try {
      return eslint.loadFormatter(formatter);
    } catch (_) {
      // Load the default formatter.
    }
  }

  return eslint.loadFormatter();
}

async function removeIgnoredWarnings(results, eslint) {
  const filterPromises = results.map(async (result) => {
    // Short circuit the call to isPathIgnored.
    //   fatal is false for ignored file warnings.
    //   ruleId is unset for internal ESLint errors.
    //   line is unset for warnings not involving file contents.
    const ignored =
      result.warningCount === 1 &&
      result.errorCount === 0 &&
      !result.messages[0].fatal &&
      !result.messages[0].ruleId &&
      !result.messages[0].line &&
      (await eslint.isPathIgnored(result.filePath));

    return ignored ? false : result;
  });

  return (await Promise.all(filterPromises)).filter((result) => !!result);
}
