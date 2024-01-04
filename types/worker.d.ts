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
