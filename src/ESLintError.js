class ESLintError extends Error {
  /**
   * @param {string=} messages
   */
  constructor(messages) {
    super(`\u001b[1;31m[eslint]\u001b[1;0m ${messages}`);
    this.name = 'ESLintError';
    this.stack = '';
  }
}

export default ESLintError;
