class LintError extends Error {
  /**
   * @param {string} linter the name of the linter that produced the messages
   * @param {string=} messages messages
   */
  constructor(linter, messages) {
    super(`[${linter}] ${messages}`);
    this.name = "LintError";
    this.linter = linter;
    this.stack = "";
  }
}

module.exports = LintError;
