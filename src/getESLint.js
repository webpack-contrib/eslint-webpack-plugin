const { cpus } = require('os');

const { Worker: JestWorker } = require('jest-worker');

// @ts-ignore
const { setup, lintFiles } = require('./worker');
const { getESLintOptions } = require('./options');
const { jsonStringifyReplacerSortKeys } = require('./utils');

/** @type {{[key: string]: any}} */
const cache = {};

/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('./options').Options} Options */
/** @typedef {() => Promise<void>} AsyncTask */
/** @typedef {(files: string|string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {{threads: number, eslint: ESLint, lintFiles: LintTask, cleanup: AsyncTask}} Linter */
/** @typedef {JestWorker & {lintFiles: LintTask}} Worker */

/**
 * @param {Options} options
 * @returns {Promise<Linter>}
 */
async function loadESLint(options) {
  const { eslintPath } = options;
  const eslint = await setup({
    eslintPath,
    configType: options.configType,
    eslintOptions: getESLintOptions(options),
  });

  return {
    threads: 1,
    lintFiles,
    eslint,
    // no-op for non-threaded
    cleanup: async () => {},
  };
}

/**
 * @param {string|undefined} key
 * @param {number} poolSize
 * @param {Options} options
 * @returns {Promise<Linter>}
 */
async function loadESLintThreaded(key, poolSize, options) {
  const cacheKey = getCacheKey(key, options);
  const { eslintPath = 'eslint' } = options;
  const source = require.resolve('./worker');
  const workerOptions = {
    enableWorkerThreads: true,
    numWorkers: poolSize,
    setupArgs: [
      {
        eslintPath,
        configType: options.configType,
        eslintOptions: getESLintOptions(options),
      },
    ],
  };

  const local = await loadESLint(options);

  let worker = /** @type {Worker?} */ (new JestWorker(source, workerOptions));

  /** @type {Linter} */
  const context = {
    ...local,
    threads: poolSize,
    lintFiles: async (files) =>
      (worker && (await worker.lintFiles(files))) ||
      /* istanbul ignore next */ [],
    cleanup: async () => {
      cache[cacheKey] = local;
      context.lintFiles = (files) => local.lintFiles(files);
      if (worker) {
        worker.end();
        worker = null;
      }
    },
  };

  return context;
}

/**
 * @param {string|undefined} key
 * @param {Options} options
 * @returns {Promise<Linter>}
 */
async function getESLint(key, { threads, ...options }) {
  const max =
    typeof threads !== 'number'
      ? threads
        ? cpus().length - 1
        : 1
      : /* istanbul ignore next */
        threads;

  const cacheKey = getCacheKey(key, { threads, ...options });
  if (!cache[cacheKey]) {
    cache[cacheKey] =
      max > 1
        ? await loadESLintThreaded(key, max, options)
        : await loadESLint(options);
  }
  return cache[cacheKey];
}

/**
 * @param {string|undefined} key
 * @param {Options} options
 * @returns {string}
 */
function getCacheKey(key, options) {
  return JSON.stringify({ key, options }, jsonStringifyReplacerSortKeys);
}

module.exports = {
  loadESLint,
  loadESLintThreaded,
  getESLint,
};
