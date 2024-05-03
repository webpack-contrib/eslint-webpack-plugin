export type setupOptions = {
  /**
   * - import path of eslint
   */
  eslintPath?: string | undefined;
  configType?: string | undefined;
  /**
   * - linter options
   */
  eslintOptions: ESLintOptions;
};
export type ESLint = import('eslint').ESLint;
export type ESLintOptions = import('eslint').ESLint.Options;
export type LintResult = import('eslint').ESLint.LintResult;
export type ESLintClass = {
  new (arg0: ESLintOptions): ESLint;
  outputFixes: (arg0: LintResult[]) => any;
};
