import { resolve } from 'path';
import { statSync } from 'fs';

// @ts-ignore
import normalizePath from 'normalize-path';
// @ts-ignore
import arrify from 'arrify';

/**
 * @param {string|string[]} files
 * @param {string} context
 * @returns {string[]}
 */
export function parseFiles(files, context) {
  return arrify(files).map((/** @type {string} */ file) =>
    normalizePath(resolve(context, file))
  );
}

/**
 * @param {string|string[]} patterns
 * @param {string|string[]} extensions
 * @returns {string[]}
 */
export function parseFoldersToGlobs(patterns, extensions = []) {
  const extensionsList = arrify(extensions);
  const [prefix, postfix] = extensionsList.length > 1 ? ['{', '}'] : ['', ''];
  const extensionsGlob = extensionsList
    .map((/** @type {string} */ extension) => extension.replace(/^\./u, ''))
    .join(',');

  return arrify(patterns).map((/** @type {string} */ pattern) => {
    try {
      // The patterns are absolute because they are prepended with the context.
      const stats = statSync(pattern);
      /* istanbul ignore else */
      if (stats.isDirectory()) {
        return pattern.replace(
          /[/\\]*?$/u,
          `/**${
            extensionsGlob ? `/*.${prefix + extensionsGlob + postfix}` : ''
          }`
        );
      }
    } catch (_) {
      // Return the pattern as is on error.
    }
    return pattern;
  });
}

/**
 *
 * @param {string} _ key, but unused
 * @param {any} value
 */
export const jsonStringifyReplacerSortKeys = (_, value) => {
  /**
   * @param {{ [x: string]: any; }} sorted
   * @param {string | number} key
   */
  const insert = (sorted, key) => {
    // eslint-disable-next-line no-param-reassign
    sorted[key] = value[key];
    return sorted;
  };

  return value instanceof Object && !(value instanceof Array)
    ? Object.keys(value).sort().reduce(insert, {})
    : value;
};
