import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const require = createRequire(import.meta.url);
const eslintPath = join(import.meta.dirname, "mock/eslint-recorder");

describe("eslint lint", () => {
  beforeEach(() => {
    require(eslintPath)._reset();
  });

  it("should lint one file", async () => {
    const compiler = pack("lint-one", { eslintPath });

    await compiler.runAsync();
    assert.strictEqual(require(eslintPath)._calls.length, 1);
  });

  it("should lint two files", async () => {
    const compiler = pack("lint-two", { eslintPath });

    await compiler.runAsync();

    const [files] = require(eslintPath)._calls;

    assert.strictEqual(files.length, 2);
    assert.match(files[0], /lint-two-entry\.js/u);
    assert.match(files[1], /lint\.js/u);
  });

  it("should lint more files", async () => {
    // The files are recorded where they are linted, so this lints them here.
    const compiler = pack("lint-more", { eslintPath, threads: false });

    await compiler.runAsync();

    const [files] = require(eslintPath)._calls;

    assert.strictEqual(files.length, 3);
    assert.match(files[0], /lint-more-entry\.js/u);
    assert.match(files[1], /lint-more\.js/u);
    assert.match(files[2], /lint\.js/u);
  });
});
