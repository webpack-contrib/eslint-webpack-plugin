import pack from './utils/pack';

describe('exclude', () => {
  it('should exclude with globs', async () => {
    const compiler = pack('exclude', { exclude: ['*error*'] });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should exclude files', async () => {
    const compiler = pack('exclude', { exclude: ['error.js'] });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should exclude folders', async () => {
    const compiler = pack('exclude-folder', { exclude: ['folder'] });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
