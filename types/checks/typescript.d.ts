declare namespace _default {
  export let name: string;
  export let label: string;
  export let filesSource: string;
  export const schema: any;
  export namespace defaults {
    let extensions: string[];
  }
  export function defaultExclude(): string;
  export { create };
}
export default _default;
export type EXPECTED_ANY = any;
export type CheckContext = import("./index.js").CheckContext;
export type CheckInstance = import("./index.js").CheckInstance;
export type Format = import("./index.js").Format;
export type FormatterOption = import("./index.js").FormatterOption;
export type Options = import("../options.js").CheckOptions;
export type TypeScript = EXPECTED_ANY;
export type Diagnostic = EXPECTED_ANY;
/**
 * @param {Options} options plugin options
 * @returns {EXPECTED_ANY} the options TypeScript itself understands
 */
export function getTypeScriptOptions(options: Options): EXPECTED_ANY;
/**
 * @param {CheckContext} context check context
 * @returns {Promise<CheckInstance>} typescript check
 */
declare function create({ options }: CheckContext): Promise<CheckInstance>;
