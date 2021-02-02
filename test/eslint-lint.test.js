import pack from './utils/pack';

describe('eslint lint', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should lint more files at once', (done) => {
    jest.mock('eslint', () => {
      return {
        ESLint: function ESLint() {
          this.lintFiles = async (files) => {
            expect(files.length).toBe(2);

            return [];
          };
        },
      };
    });

    const compiler = pack('good', { threads: false });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
