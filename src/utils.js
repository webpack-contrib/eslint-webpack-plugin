// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

import { statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, resolve } from "node:path";

import { pathToFileURL } from "node:url";

import normalizePath from "normalize-path";

const nodeRequire = createRequire(import.meta.url);

/** @typedef {import("webpack").Compiler} Compiler */

/**
 * @template T
 * @typedef {T extends (null | undefined)
 * ? []
 * : T extends string
 * ? [string]
 * : T extends readonly unknown[]
 * ? T
 * : T extends Iterable<infer T>
 * ? T[]
 * : [T]} ArrifyResult
 */

/* istanbul ignore next */
/**
 * @template T
 * @param {T} value value
 * @returns {ArrifyResult<T>} array of values
 */
function arrify(value) {
  if (value === null || value === undefined) {
    return /** @type {ArrifyResult<T>} */ ([]);
  }

  if (Array.isArray(value)) {
    return /** @type {ArrifyResult<T>} */ (value);
  }

  if (typeof value === "string") {
    return /** @type {ArrifyResult<T>} */ ([value]);
  }

  // @ts-expect-error need better types
  if (typeof value[Symbol.iterator] === "function") {
    // @ts-expect-error need better types
    return [...value];
  }

  return /** @type {ArrifyResult<T>} */ ([value]);
}

/**
 * A package name is imported as it is, so a test can still mock it. A path may
 * name a directory or a CommonJS entry, neither of which ESM resolves, so
 * CommonJS resolution finds the file first.
 * @param {string} specifier a module specifier or path
 * @returns {Promise<EXPECTED_ANY>} the imported module
 */
async function importFrom(specifier) {
  if (!specifier.startsWith(".") && !isAbsolute(specifier)) {
    return import(specifier);
  }

  try {
    return await import(pathToFileURL(nodeRequire.resolve(specifier)).href);
  } catch {
    return import(specifier);
  }
}

/**
 * @param {string | string[]} files files
 * @param {string} context context
 * @returns {string[]} normalized paths
 */
function parseFiles(files, context) {
  return arrify(files).map((/** @type {string} */ file) =>
    normalizePath(resolve(context, file)),
  );
}

/**
 * @param {string | string[]} patterns patterns
 * @param {string | string[]} extensions extensions
 * @returns {string[]} globs
 */
function parseFoldersToGlobs(patterns, extensions = []) {
  const extensionsList = arrify(extensions);
  const [prefix, postfix] = extensionsList.length > 1 ? ["{", "}"] : ["", ""];
  const extensionsGlob = extensionsList
    .map((/** @type {string} */ extension) => extension.replace(/^\./u, ""))
    .join(",");

  return arrify(patterns).map((/** @type {string} */ pattern) => {
    try {
      // The patterns are absolute because they are prepended with the context.
      const stats = statSync(pattern);
      /* istanbul ignore else */
      if (stats.isDirectory()) {
        return pattern.replace(
          /[/\\]*?$/u,
          `/**${
            extensionsGlob ? `/*.${prefix + extensionsGlob + postfix}` : ""
          }`,
        );
      }
    } catch {
      // Return the pattern as is on error.
    }
    return pattern;
  });
}

/**
 * @param {{ [key: string]: EXPECTED_ANY }} options options
 * @param {{ [key: string]: EXPECTED_ANY }} properties schema properties to drop
 * @param {string[]=} keep keys to keep even when the schema describes them
 * @returns {{ [key: string]: EXPECTED_ANY }} options the tool itself understands
 */
function omitPluginOptions(options, properties, keep = []) {
  const toolOptions = { ...options };

  // No need to guard the for-in because the schema properties are hardcoded.

  for (const option in properties) {
    if (!keep.includes(option)) {
      delete toolOptions[option];
    }
  }

  return toolOptions;
}

/**
 * @param {string} _ key, but unused
 * @param {EXPECTED_ANY} value value
 * @returns {{ [key: string]: EXPECTED_ANY }} result
 */
const jsonStringifyReplacerSortKeys = (_, value) => {
  /**
   * @param {{ [key: string]: EXPECTED_ANY }} sorted sorted
   * @param {string | number} key key
   * @returns {{ [key: string]: EXPECTED_ANY }} result
   */
  const insert = (sorted, key) => {
    sorted[key] = value[key];
    return sorted;
  };

  return value instanceof Object && !Array.isArray(value)
    ? Object.keys(value).toSorted().reduce(insert, {})
    : value;
};

/**
 * @param {Compiler} compiler compiler
 * @param {string} name absolute file name
 * @param {string | Buffer} content content
 * @returns {Promise<void>}
 */
function writeOutputFile(compiler, name, content) {
  return /** @type {Promise<void>} */ (
    new Promise((finish, bail) => {
      if (!compiler.outputFileSystem) return;

      const { mkdir, writeFile } = compiler.outputFileSystem;

      mkdir(dirname(name), { recursive: true }, (err) => {
        /* istanbul ignore if */
        if (err) {
          bail(err);
        } else {
          writeFile(name, content, (/** @type {unknown} */ err2) => {
            /* istanbul ignore if */
            if (err2) bail(err2);
            else finish();
          });
        }
      });
    })
  );
}

export {
  arrify,
  importFrom,
  jsonStringifyReplacerSortKeys,
  omitPluginOptions,
  parseFiles,
  parseFoldersToGlobs,
  writeOutputFile,
};
