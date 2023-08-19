import pack from './utils/pack';

describe('resource-query', () => {
  it('should exclude the match resource query', (done) => {
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

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
