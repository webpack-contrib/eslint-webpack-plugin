import ESLintError from "../src/ESLintError";

import pack from "./utils/pack";

describe("eslintignore", () => {
  it("should ignores files present in .eslintignore", (done) => {
    const compiler = pack("ignore", { ignore: true });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(
        stats.compilation.errors.filter((x) => x instanceof ESLintError)
      ).toEqual([]);

      done();
    });
  });
});
