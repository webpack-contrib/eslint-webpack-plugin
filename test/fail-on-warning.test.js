import pack from './utils/pack';

describe('fail on warning', () => {
  it('should emits errors', async () => {
    const compiler = pack('warn', { failOnWarning: true });

    await expect(compiler.runAsync()).rejects.toThrow('warning');
  });

  it('should correctly identifies a success', async () => {
    const compiler = pack('good', { failOnWarning: true });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });
});
