import pack from './utils/pack';

describe('warning', () => {
  it('should emit warnings', async () => {
    const compiler = pack('warn');

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(false);
  });
});
