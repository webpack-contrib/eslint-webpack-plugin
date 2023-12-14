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

  it('should lint one file', async () => {
    const compiler = pack('lint-one', { threads: false });

    await compiler.runAsync();
    expect(mockLintFiles).toHaveBeenCalledTimes(1);
  });

  it('should lint two files', async () => {
    const compiler = pack('lint-two', { threads: false });

    await compiler.runAsync();
    expect(mockLintFiles).toHaveBeenCalledTimes(2);
  });

  it('should lint more files', async () => {
    const compiler = pack('lint-more', { threads: false });

    await compiler.runAsync();
    expect(mockLintFiles).toHaveBeenCalledTimes(3);
  });
});
