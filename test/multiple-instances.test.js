import ESLintPlugin from "../src";

import pack from "./utils/pack";

describe("multiple instances", () => {
  it("should don't fail", (done) => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new ESLintPlugin({ ignore: false, exclude: "error.js" }),
          new ESLintPlugin({ ignore: false, exclude: "error.js" }),
        ],
      }
    );

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it("should fail on first instance", (done) => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new ESLintPlugin({ ignore: false, exclude: "good.js" }),
          new ESLintPlugin({ ignore: false, exclude: "error.js" }),
        ],
      }
    );

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });

  it("should fail on second instance", (done) => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new ESLintPlugin({ ignore: false, exclude: "error.js" }),
          new ESLintPlugin({ ignore: false, exclude: "good.js" }),
        ],
      }
    );

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      done();
    });
  });
});
