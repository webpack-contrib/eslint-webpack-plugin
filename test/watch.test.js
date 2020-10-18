import pack from './utils/pack';

describe('watch', () => {
  it('should watch', (done) => {
    const compiler = pack('good');

    const watch = compiler.watch({}, (err, stats) => {
      watch.close();
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
