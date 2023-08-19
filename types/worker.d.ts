export type setupOptions = {
  /**
   * - import path of eslint
   */
  eslintPath?: string | undefined;
  /**
   * - linter options
   */
  eslintOptions?: ESLintOptions | undefined;
};
export type ESLint = import('eslint').ESLint;
export type ESLintOptions = import('eslint').ESLint.Options;
export type LintResult = import('eslint').ESLint.LintResult;
export type File = import('./linter').File;
