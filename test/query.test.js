import pack from './utils/pack';

describe('query', () => {
  it('should correctly resolve file despite query path', async () => {
    const compiler = pack(
      'query',
      {},
      {
        resolve: {
          alias: {
            'alias-ignore': false,
          },
        },
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
