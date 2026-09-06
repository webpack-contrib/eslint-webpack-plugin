export = LintError;
declare class LintError extends Error {
  /**
   * @param {string} linter the name of the linter that produced the messages
   * @param {string=} messages messages
   */
  constructor(linter: string, messages?: string | undefined);
  linter: string;
  stack: string;
}
