import pack from './utils/pack';

describe('formatter eslint', () => {
  it('should use custom formatter as function', (done) => {
    const formatter = require('./mock/formatter');
    const compiler = pack('error', { formatter });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(stats.compilation.errors[0].message).toBeTruthy();
      const message = JSON.parse(stats.compilation.errors[0].message);
      expect(message.formatter).toEqual('mock');
      expect(message.results).toBeTruthy();
      done();
    });
  });

  it('should use custom formatter as string', (done) => {
    const formatter = './test/mock/formatter';
    const compiler = pack('error', { formatter });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(stats.compilation.errors[0].message).toBeTruthy();
      const message = JSON.parse(stats.compilation.errors[0].message);
      expect(message.formatter).toEqual('mock');
      expect(message.results).toBeTruthy();
      done();
    });
  });
});
