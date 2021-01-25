// @ts-ignore
import WebpackError from 'webpack/lib/WebpackError';

export default class ESLintError extends WebpackError {
  /**
   * @param {string=} messages
   */
  constructor(messages) {
    super(messages);
    this.name = 'ESLintError';
    this.stack = '';
  }
}
