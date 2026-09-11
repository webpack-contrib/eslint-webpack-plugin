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
  export function resultPath(result: EXPECTED_ANY): string;
}
export default _default;
export type EXPECTED_ANY = any;
export type CheckContext = import("./index.js").CheckContext;
export type CheckInstance = import("./index.js").CheckInstance;
export type Options = import("../options.js").CheckOptions;
export type FileResult = {
  /**
   * the file every diagnostic of it was found in
   */
  filename: string;
  /**
   * what oxlint found there
   */
  diagnostics: Diagnostic[];
};
export type Diagnostic = {
  /**
   * what oxlint found
   */
  message: string;
  /**
   * the rule it came from
   */
  code?: string | undefined;
  /**
   * how oxlint rates it
   */
  severity: string;
  /**
   * the file it was found in
   */
  filename: string;
  /**
   * what oxlint suggests
   */
  help?: string | undefined;
  /**
   * where it is
   */
  labels?:
    | {
        label?: string;
        span: {
          line: number;
          column: number;
        };
      }[]
    | undefined;
};
/**
 * @param {CheckContext} context check context
 * @returns {Promise<CheckInstance>} oxlint check
 */
declare function create({ options }: CheckContext): Promise<CheckInstance>;
