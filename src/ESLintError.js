class ESLintError extends Error {
  /**
   * @param {string=} messages
   */
  constructor(messages) {
    super(messages);
    this.name = "ESLintError";
    this.stack = "";
  }
}

export default ESLintError;
