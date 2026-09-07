import { join } from "node:path";

import pack from "./utils/pack";

describe("error", () => {
  it("should return error if file is bad", async () => {
    const compiler = pack("error");

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it("should propagate eslint exceptions as errors", async () => {
    const eslintPath = join(import.meta.dirname, "mock/eslint-error");
    const compiler = pack("good", { eslintPath });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toContain("Oh no!");
  });
});
