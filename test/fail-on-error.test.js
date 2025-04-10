import pack from './utils/pack';

describe('fail on error', () => {
  it('should emits errors', async () => {
    const compiler = pack('error', { failOnError: true });

    await expect(compiler.runAsync()).rejects.toThrow('error');
  });

  it('should emit warnings when disabled', async () => {
    const compiler = pack('error', { failOnError: false });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it('should correctly identifies a success', async () => {
    const compiler = pack('good', { failOnError: true });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });
});
