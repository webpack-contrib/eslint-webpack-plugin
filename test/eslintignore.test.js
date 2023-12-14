import ESLintError from '../src/ESLintError';

import pack from './utils/pack';

describe('eslintignore', () => {
  it('should ignores files present in .eslintignore', async () => {
    const compiler = pack('ignore', { ignore: true });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(
      stats.compilation.errors.filter((x) => x instanceof ESLintError),
    ).toEqual([]);
  });
});
