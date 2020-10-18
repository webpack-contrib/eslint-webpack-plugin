import pack from './utils/pack';

describe('force emit error', () => {
  it('should force to emit error', (done) => {
    const compiler = pack('error-warn', { emitError: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });
});
