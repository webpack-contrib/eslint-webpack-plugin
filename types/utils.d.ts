export type ArrifyResult<T> = T extends null | undefined
  ? []
  : T extends string
    ? [string]
    : T extends readonly unknown[]
      ? T
      : T extends Iterable<infer T_1>
        ? T_1[]
        : [T];
export type EXPECTED_ANY = any;
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
/**
 * @template T
 * @param {T} value value
 * @returns {ArrifyResult<T>} array of values
 */
export function arrify<T>(value: T): ArrifyResult<T>;
/**
 * @param {string | string[]} files files
 * @param {string} context context
 * @returns {string[]} normalized paths
 */
export function parseFiles(files: string | string[], context: string): string[];
/**
 * @param {string | string[]} patterns patterns
 * @param {string | string[]} extensions extensions
 * @returns {string[]} globs
 */
export function parseFoldersToGlobs(
  patterns: string | string[],
  extensions?: string | string[],
): string[];
