/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.Options} ESLintOptions */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('./linter').File} File */

Object.assign(module.exports, {
  lintFiles,
  setup,
});

/** @type {{ new (arg0: ESLintOptions): ESLint; outputFixes: (arg0: LintResult[]) => any; }} */
let ESLint;

/** @type {ESLint} */
let eslint;

/** @type {boolean} */
let fix;

/**
 * @typedef {object} setupOptions
 * @property {string=} eslintPath - import path of eslint
 * @property {string=} configType
 * @property {ESLintOptions} eslintOptions - linter options
 *
 * @param {setupOptions} arg0 - setup worker
 */
function setup({ eslintPath, configType, eslintOptions }) {
  fix = !!(eslintOptions && eslintOptions.fix);
  const eslintModule = require(eslintPath || 'eslint');

  let FlatESLint;

  if (eslintModule.LegacyESLint) {
    ESLint = eslintModule.LegacyESLint;
    ({ FlatESLint } = eslintModule);
  } else {
    ({ ESLint } = eslintModule);

    if (configType === 'flat') {
      throw new Error(
        "Couldn't find FlatESLint, you might need to set eslintPath to 'eslint/use-at-your-own-risk'",
      );
    }
  }

  if (configType === 'flat') {
    eslint = new FlatESLint(eslintOptions);
  } else {
    eslint = new ESLint(eslintOptions);
  }

  return eslint;
}

/**
 * @param {File[]} files
 */
async function lintFiles(files) {
  /** @type {LintResult[]} */
  const results = [];

  await Promise.all(
    files.map(async (file) => {
      const result = await eslint.lintText(file.content, {
        filePath: file.path,
      });
      /* istanbul ignore if */
      if (result) {
        results.push(...result);
      }
    }),
  );

  // istanbul ignore else
  if (fix) {
    await ESLint.outputFixes(results);
  }

  return results;
}
