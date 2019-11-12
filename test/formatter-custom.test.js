import pack from './utils/pack';

describe('formatter eslint', () => {
  it('should use custom formatter as function', (done) => {
    const formatter = require('eslint-friendly-formatter');
    const compiler = pack('error', { formatter });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(stats.compilation.errors[0].message).toBeTruthy();
      done();
    });
  });

  it('should use custom formatter as string', (done) => {
    const formatter = 'eslint-friendly-formatter';
    const compiler = pack('error', { formatter });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(stats.compilation.errors[0].message).toBeTruthy();
      done();
    });
  });
});
