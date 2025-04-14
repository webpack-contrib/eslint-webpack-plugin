import ESLintPlugin from '../src';

import pack from './utils/pack';

describe('multiple instances', () => {
  it("should don't fail", async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({
            configType: 'eslintrc',
            ignore: false,
            exclude: 'error.js',
          }),
          new ESLintPlugin({
            configType: 'eslintrc',
            ignore: false,
            exclude: 'error.js',
          }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should fail on first instance', async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({
            configType: 'eslintrc',
            ignore: false,
            exclude: 'good.js',
          }),
          new ESLintPlugin({
            configType: 'eslintrc',
            ignore: false,
            exclude: 'error.js',
          }),
        ],
      },
    );

    await expect(compiler.runAsync()).rejects.toThrow();
  });

  it('should fail on second instance', async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({
            configType: 'eslintrc',
            ignore: false,
            exclude: 'error.js',
          }),
          new ESLintPlugin({
            configType: 'eslintrc',
            ignore: false,
            exclude: 'good.js',
          }),
        ],
      },
    );

    await expect(compiler.runAsync()).rejects.toThrow();
  });
});
