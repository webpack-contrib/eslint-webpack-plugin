export default class ESLintError extends WebpackError {
  /**
   * @param {string=} messages
   */
  constructor(messages?: string | undefined);
}
import { WebpackError } from 'webpack';
