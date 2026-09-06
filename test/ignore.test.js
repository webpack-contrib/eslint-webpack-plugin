import LintError from "../src/LintError";
import pack from "./utils/pack";

describe("eslintignore", () => {
  it("should ignores files present in .eslintignore", async () => {
    const compiler = pack("ignore", {
      ignore: true,
      ignorePatterns: ["**/ignore.js"],
    });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(
      stats.compilation.errors.filter((x) => x instanceof LintError),
    ).toEqual([]);
  });
});
