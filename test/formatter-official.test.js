import pack from './utils/pack';

describe('formatter official', () => {
  it('should use official formatter', async () => {
    const compiler = pack('error', { formatter: 'json' });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
  });
});
