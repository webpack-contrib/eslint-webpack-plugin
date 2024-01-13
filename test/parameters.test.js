import pack from './utils/pack';

describe('parameters', () => {
  it('should supports query strings parameters', async () => {
    const loaderOptions = {
      overrideConfig: {
        rules: { semi: 0 },
      },
    };
    const compiler = pack('good', loaderOptions);

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
