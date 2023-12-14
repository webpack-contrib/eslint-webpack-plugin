import pack from './utils/pack';

describe('formatter eslint', () => {
  it('should use eslint formatter', async () => {
    const compiler = pack('error');

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
  });
});
