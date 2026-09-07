import { createRequire } from "node:module";
import { join } from "node:path";

import pack from "./utils/pack";

const require = createRequire(import.meta.url);
const eslintPath = join(import.meta.dirname, "mock/eslint-recorder");

describe("eslint lint", () => {
  beforeEach(() => {
    require(eslintPath)._reset();
  });

  it("should lint one file", async () => {
    const compiler = pack("lint-one", { eslintPath });

    await compiler.runAsync();
    expect(require(eslintPath)._calls).toHaveLength(1);
  });

  it("should lint two files", async () => {
    const compiler = pack("lint-two", { eslintPath });

    await compiler.runAsync();
    expect(require(eslintPath)._calls[0]).toEqual([
      expect.stringMatching("lint-two-entry.js"),
      expect.stringMatching("lint.js"),
    ]);
  });

  it("should lint more files", async () => {
    const compiler = pack("lint-more", { eslintPath });

    await compiler.runAsync();
    expect(require(eslintPath)._calls[0]).toEqual([
      expect.stringMatching("lint-more-entry.js"),
      expect.stringMatching("lint-more.js"),
      expect.stringMatching("lint.js"),
    ]);
  });
});
