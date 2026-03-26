import pack from "./utils/pack";

describe("eslint lint", () => {
  const mockLintFiles = jest.fn().mockReturnValue([]);

  beforeAll(() => {
    jest.mock("eslint", () => {
      function ESLint() {
        this.lintFiles = mockLintFiles;
      }

      ESLint.version = "9.0.0";

      return {
        ESLint,
        async loadESLint() {
          return ESLint;
        },
      };
    });
  });

  beforeEach(() => {
    mockLintFiles.mockClear();
  });

  it("should lint one file", async () => {
    const compiler = pack("lint-one");

    await compiler.runAsync();
    expect(mockLintFiles).toHaveBeenCalledTimes(1);
  });

  it("should lint two files", async () => {
    const compiler = pack("lint-two");

    await compiler.runAsync();
    const files = [
      expect.stringMatching("lint-two-entry.js"),
      expect.stringMatching("lint.js"),
    ];
    expect(mockLintFiles).toHaveBeenCalledWith(files);
  });

  it("should lint more files", async () => {
    const compiler = pack("lint-more");

    await compiler.runAsync();
    const files = [
      expect.stringMatching("lint-more-entry.js"),
      expect.stringMatching("lint-more.js"),
      expect.stringMatching("lint.js"),
    ];
    expect(mockLintFiles).toHaveBeenCalledWith(files);
  });
});
