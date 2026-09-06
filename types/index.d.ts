export = LintWebpackPlugin;
declare class LintWebpackPlugin {
  /**
   * @param {Options=} options options
   */
  constructor(options?: Options | undefined);
  key: string;
  options: import("./options").NormalizedOptions;
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
declare namespace LintWebpackPlugin {
  export {
    Compilation,
    Compiler,
    Module,
    NormalModule,
    Runner,
    LinterAdapter,
    EnabledLinter,
    LinterOptions,
    Options,
    ResolvedLinter,
  };
}
type Compilation = import("webpack").Compilation;
type Compiler = import("webpack").Compiler;
type Module = import("webpack").Module;
type NormalModule = import("webpack").NormalModule;
type Runner = import("./linter").Runner;
type LinterAdapter = import("./linters").LinterAdapter;
type EnabledLinter = import("./options").EnabledLinter;
type LinterOptions = import("./options").LinterOptions;
type Options = import("./options").Options;
type ResolvedLinter = {
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
