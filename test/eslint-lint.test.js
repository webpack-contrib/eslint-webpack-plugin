import pack from './utils/pack';

describe('eslint lint', () => {
  const mockLintFiles = jest.fn().mockReturnValue([]);

  beforeAll(() => {
    jest.mock('eslint', () => {
      return {
        ESLint: function ESLint() {
          this.lintText = mockLintFiles;
        },
      };
    });
  });

  beforeEach(() => {
    mockLintFiles.mockClear();
  });

  it('should lint one file', (done) => {
    const compiler = pack('lint-one', { threads: false });

    compiler.run((err) => {
      expect(mockLintFiles).toHaveBeenCalledTimes(1);
      expect(err).toBeNull();
      done();
    });
  });

  it('should lint two files', (done) => {
    const compiler = pack('lint-two', { threads: false });

    compiler.run((err) => {
      expect(mockLintFiles).toHaveBeenCalledTimes(2);
      expect(err).toBeNull();
      done();
    });
  });

  it('should lint more files', (done) => {
    const compiler = pack('lint-more', { threads: false });

    compiler.run((err) => {
      expect(mockLintFiles).toHaveBeenCalledTimes(3);
      expect(err).toBeNull();
      done();
    });
  });
});
