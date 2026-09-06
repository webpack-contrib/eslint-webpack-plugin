import LintPlugin from "../../src";

import pack from "./utils/pack";

describe("empty", () => {
  it("no error when no files matching", async () => {
    const compiler = pack(
      "empty",
      {},
      {
        plugins: [new LintPlugin({ stylelint: true })],
      },
    );
    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
