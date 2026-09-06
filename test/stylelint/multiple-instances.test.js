import LintPlugin from "../../src";

import pack from "./utils/pack";

describe("multiple instances", () => {
  it("should don't fail", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new LintPlugin({ stylelint: true, exclude: "error.scss" }),
          new LintPlugin({ stylelint: true, exclude: "error.scss" }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it("should fail on first instance", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new LintPlugin({ stylelint: true, exclude: "good.scss" }),
          new LintPlugin({ stylelint: true, exclude: "error.scss" }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it("should fail on second instance", async () => {
    const compiler = pack(
      "multiple",
      {},
      {
        plugins: [
          new LintPlugin({ stylelint: true, exclude: "error.scss" }),
          new LintPlugin({ stylelint: true, exclude: "good.scss" }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
