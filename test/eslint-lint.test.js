import pack from "./utils/pack";

describe("eslint lint", () => {
  const mockLintFiles = jest.fn().mockReturnValue([]);

  beforeAll(() => {
    jest.mock("eslint", () => {
      return {
        ESLint: function ESLint() {
          this.lintFiles = mockLintFiles;
        },
      };
    });
  });

  beforeEach(() => {
    mockLintFiles.mockClear();
  });

  it("should lint one file", (done) => {
    const compiler = pack("lint-one", { threads: false });

    compiler.run((err) => {
      const files = [expect.stringMatching("lint-one-entry.js")];
      expect(mockLintFiles).toHaveBeenCalledWith(files);
      expect(err).toBeNull();
      done();
    });
  });

  it("should lint two files", (done) => {
    const compiler = pack("lint-two", { threads: false });

    compiler.run((err) => {
      const files = [
        expect.stringMatching("lint-two-entry.js"),
        expect.stringMatching("lint.js"),
      ];
      expect(mockLintFiles).toHaveBeenCalledWith(files);
      expect(err).toBeNull();
      done();
    });
  });

  it("should lint more files", (done) => {
    const compiler = pack("lint-more", { threads: false });

    compiler.run((err) => {
      const files = [
        expect.stringMatching("lint-more-entry.js"),
        expect.stringMatching("lint-more.js"),
        expect.stringMatching("lint.js"),
      ];
      expect(mockLintFiles).toHaveBeenCalledWith(files);
      expect(err).toBeNull();
      done();
    });
  });
});
