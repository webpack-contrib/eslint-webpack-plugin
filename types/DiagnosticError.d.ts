export default DiagnosticError;
declare class DiagnosticError extends Error {
  /**
   * @param {string} check the name of the check that produced the messages
   * @param {string=} messages messages
   */
  constructor(check: string, messages?: string | undefined);
  check: string;
  stack: string;
}
