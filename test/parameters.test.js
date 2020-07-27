import pack from './utils/pack';

describe('parameters', () => {
  it('should supports query strings parameters', (done) => {
    const loaderOptions = {
      overrideConfig: {
        rules: { semi: 0 },
      },
    };
    const compiler = pack('good', loaderOptions);

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
