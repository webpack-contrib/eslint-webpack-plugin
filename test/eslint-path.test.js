import { join } from "node:path";

import pack from "./utils/pack";

describe("eslint path", () => {
  it("should use another instance of eslint via eslintPath config", async () => {
    const eslintPath = join(import.meta.dirname, "mock/eslint");
    const compiler = pack("good", { eslintPath });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toContain("Fake error");
  });
});
