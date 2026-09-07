export default LintWebpackPlugin;
export type Compilation = import("webpack").Compilation;
export type Compiler = import("webpack").Compiler;
export type Module = import("webpack").Module;
export type NormalModule = import("webpack").NormalModule;
export type Runner = import("./linter.js").Runner;
export type LinterAdapter = import("./linters/index.js").LinterAdapter;
export type EnabledLinter = import("./options.js").EnabledLinter;
export type LinterOptions = import("./options.js").LinterOptions;
export type Options = import("./options.js").Options;
export type ResolvedLinter = {
  /**
   * linter name
   */
  name: string;
  /**
   * linter adapter
   */
  adapter: LinterAdapter;
  /**
   * options resolved for this linter
   */
  options: LinterOptions;
  /**
   * the globs of the files to lint
   */
  wanted: string[];
  /**
   * the globs of the files not to lint
   */
  exclude: string[];
};
declare class LintWebpackPlugin {
  /**
   * @param {Options} options options
   */
  constructor(options?: Options);
  key: string;
  options: import("./options.js").NormalizedOptions;
  /**
   * @param {Compiler} compiler compiler
   * @param {ResolvedLinter[]} linters the linters to run
   */
  run(compiler: Compiler, linters: ResolvedLinter[]): Promise<void>;
  /**
   * @param {Compiler} compiler compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   * @param {Compiler} compiler compiler
   * @param {string} context context
   * @param {EnabledLinter} linter the linter to resolve the globs of
   * @returns {ResolvedLinter} the linter with its globs resolved
   */
  resolveLinter(
    compiler: Compiler,
    context: string,
    { name, adapter, options }: EnabledLinter,
  ): ResolvedLinter;
  /**
   * @param {ResolvedLinter} linter the linter to create a runner for
   * @param {Compilation} compilation compilation
   * @returns {Runner} runner
   */
  createRunner(
    { name, adapter, options }: ResolvedLinter,
    compilation: Compilation,
  ): Runner;
  /**
   * @param {Compiler} compiler compiler
   * @returns {string} context
   */
  getContext(compiler: Compiler): string;
}
