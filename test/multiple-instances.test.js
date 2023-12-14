import ESLintPlugin from '../src';

import pack from './utils/pack';

describe('multiple instances', () => {
  it("should don't fail", async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({ ignore: false, exclude: 'error.js' }),
          new ESLintPlugin({ ignore: false, exclude: 'error.js' }),
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
          new ESLintPlugin({ ignore: false, exclude: 'good.js' }),
          new ESLintPlugin({ ignore: false, exclude: 'error.js' }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it('should fail on second instance', async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({ ignore: false, exclude: 'error.js' }),
          new ESLintPlugin({ ignore: false, exclude: 'good.js' }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
