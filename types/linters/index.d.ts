export = linters;
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("../options").LinterOptions} LinterOptions */
/**
 * A result produced by a linter, only the adapter that created it knows its shape.
 * @typedef {EXPECTED_ANY} LintResult
 */
/**
 * @typedef {string | ((results: LintResult[], ...args: EXPECTED_ANY[]) => string | Promise<string>)} FormatterOption
 */
/** @typedef {(results: LintResult[]) => Promise<string>} Format */
/**
 * @typedef {object} LinterContext
 * @property {string} key a key unique to the compiler the linter runs for
 * @property {LinterOptions} options resolved options for this linter
 * @property {Compilation} compilation the compilation being linted
 */
/**
 * @typedef {object} LinterInstance
 * @property {(files: string[]) => Promise<LintResult[]>} lintFiles lints the given files
 * @property {(results: LintResult[]) => Promise<LintResult[]>} getResults turns the raw results of every `lintFiles` call into the results to report
 * @property {(results: LintResult[]) => { errors: LintResult[], warnings: LintResult[] }} splitResults splits results into the ones reported as errors and as warnings
 * @property {(formatter?: FormatterOption) => Promise<Format>} getFormatter loads a formatter, falling back to the linter's default one
 * @property {() => Promise<void>} cleanup releases whatever the linter holds after a run
 */
/**
 * What a linter shipped outside this package has to provide; everything the
 * plugin can default is optional.
 * @typedef {object} LinterAdapterInput
 * @property {string} name the option key the linter is configured under
 * @property {(context: LinterContext) => Promise<LinterInstance>} create creates a linter for one compilation
 * @property {string=} label the human readable name, used in diagnostics
 * @property {"modules" | "glob"=} filesSource whether the linter lints the files webpack built or every file matching `files`
 * @property {{ properties: { [key: string]: EXPECTED_ANY } }=} schema JSON schema of the options only this linter understands
 * @property {{ [key: string]: EXPECTED_ANY }=} defaults default options for this linter
 * @property {((compiler: Compiler) => string | string[])=} defaultExclude the globs excluded when the user specifies none
 */
/**
 * @typedef {object} LinterAdapter
 * @property {string} name the option key the linter is configured under
 * @property {string} label the human readable name, used in diagnostics
 * @property {"modules" | "glob"} filesSource whether the linter lints the files webpack built or every file matching `files`
 * @property {{ properties: { [key: string]: EXPECTED_ANY } }} schema JSON schema of the options only this linter understands
 * @property {{ [key: string]: EXPECTED_ANY }} defaults default options for this linter
 * @property {(compiler: Compiler) => string | string[]} defaultExclude the globs excluded when the user specifies none
 * @property {(context: LinterContext) => Promise<LinterInstance>} create creates a linter for one compilation
 */
/** @type {Map<string, LinterAdapter>} */
declare const linters: Map<string, LinterAdapter>;
declare namespace linters {
  export {
    EXPECTED_ANY,
    Compilation,
    Compiler,
    LinterOptions,
    LintResult,
    FormatterOption,
    Format,
    LinterContext,
    LinterInstance,
    LinterAdapterInput,
    LinterAdapter,
  };
}
type EXPECTED_ANY = any;
type Compilation = import("webpack").Compilation;
type Compiler = import("webpack").Compiler;
type LinterOptions = import("../options").LinterOptions;
/**
 * A result produced by a linter, only the adapter that created it knows its shape.
 */
type LintResult = EXPECTED_ANY;
type FormatterOption =
  | string
  | ((
      results: LintResult[],
      ...args: EXPECTED_ANY[]
    ) => string | Promise<string>);
type Format = (results: LintResult[]) => Promise<string>;
type LinterContext = {
  /**
   * a key unique to the compiler the linter runs for
   */
  key: string;
  /**
   * resolved options for this linter
   */
  options: LinterOptions;
  /**
   * the compilation being linted
   */
  compilation: Compilation;
};
type LinterInstance = {
  /**
   * lints the given files
   */
  lintFiles: (files: string[]) => Promise<LintResult[]>;
  /**
   * turns the raw results of every `lintFiles` call into the results to report
   */
  getResults: (results: LintResult[]) => Promise<LintResult[]>;
  /**
   * splits results into the ones reported as errors and as warnings
   */
  splitResults: (results: LintResult[]) => {
    errors: LintResult[];
    warnings: LintResult[];
  };
  /**
   * loads a formatter, falling back to the linter's default one
   */
  getFormatter: (formatter?: FormatterOption) => Promise<Format>;
  /**
   * releases whatever the linter holds after a run
   */
  cleanup: () => Promise<void>;
};
/**
 * What a linter shipped outside this package has to provide; everything the
 * plugin can default is optional.
 */
type LinterAdapterInput = {
  /**
   * the option key the linter is configured under
   */
  name: string;
  /**
   * creates a linter for one compilation
   */
  create: (context: LinterContext) => Promise<LinterInstance>;
  /**
   * the human readable name, used in diagnostics
   */
  label?: string | undefined;
  /**
   * whether the linter lints the files webpack built or every file matching `files`
   */
  filesSource?: ("modules" | "glob") | undefined;
  /**
   * JSON schema of the options only this linter understands
   */
  schema?:
    | {
        properties: {
          [key: string]: EXPECTED_ANY;
        };
      }
    | undefined;
  /**
   * default options for this linter
   */
  defaults?:
    | {
        [key: string]: EXPECTED_ANY;
      }
    | undefined;
  /**
   * the globs excluded when the user specifies none
   */
  defaultExclude?: ((compiler: Compiler) => string | string[]) | undefined;
};
type LinterAdapter = {
  /**
   * the option key the linter is configured under
   */
  name: string;
  /**
   * the human readable name, used in diagnostics
   */
  label: string;
  /**
   * whether the linter lints the files webpack built or every file matching `files`
   */
  filesSource: "modules" | "glob";
  /**
   * JSON schema of the options only this linter understands
   */
  schema: {
    properties: {
      [key: string]: EXPECTED_ANY;
    };
  };
  /**
   * default options for this linter
   */
  defaults: {
    [key: string]: EXPECTED_ANY;
  };
  /**
   * the globs excluded when the user specifies none
   */
  defaultExclude: (compiler: Compiler) => string | string[];
  /**
   * creates a linter for one compilation
   */
  create: (context: LinterContext) => Promise<LinterInstance>;
};
