import pack from './utils/pack';

describe('resource-query', () => {
  it('should exclude the match resource query', async () => {
    const compiler = pack(
      'resource-query',
      {
        resourceQueryExclude: /media/,
        extensions: ['.js', '.ts'],
      },
      {
        module: { rules: [{ resourceQuery: /media/, type: 'asset/source' }] },
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
