import pack from './utils/pack';

describe('fail on warning', () => {
  it('should emits errors', (done) => {
    const compiler = pack('warn', { failOnWarning: true });

    compiler.run((err) => {
      expect(err.message).toContain('warn.js');
      done();
    });
  });

  it('should correctly indentifies a success', (done) => {
    const compiler = pack('good', { failOnWarning: true });

    compiler.run((err) => {
      expect(err).toBeNull();
      done();
    });
  });
});
