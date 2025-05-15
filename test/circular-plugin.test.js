import pack from './utils/pack';

describe('circular plugin', () => {
  it('should support plugins with circular configs', async () => {
    const plugin = {
      configs: {},
      rules: {},
      processors: {},
    };

    Object.assign(plugin.configs, {
      recommended: {
        plugins: {
          self: plugin,
        },
        rules: {},
      },
    });

    const loaderOptions = {
      configType: 'flat',
      overrideConfig: {
        plugins: { plugin: plugin },
      },
      overrideConfigFile: true,
    };

    const compiler = pack('good', loaderOptions);

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
