class DiagnosticError extends Error {
  /**
   * @param {string} check the name of the check that produced the messages
   * @param {string=} messages messages
   */
  constructor(check, messages) {
    super(`[${check}] ${messages}`);
    this.name = "DiagnosticError";
    this.check = check;
    this.stack = "";
  }
}

export default DiagnosticError;
