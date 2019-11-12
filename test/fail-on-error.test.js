import pack from './utils/pack';

describe('fail on error', () => {
  it('should emits errors', (done) => {
    const compiler = pack('error', { failOnError: true });

    compiler.run((err) => {
      expect(err.message).toContain('error.js');
      done();
    });
  });

  it('should correctly indentifies a success', (done) => {
    const compiler = pack('good', { failOnError: true });

    compiler.run((err) => {
      expect(err).toBeNull();
      done();
    });
  });
});
