import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const require = createRequire(import.meta.url);

describe("stylelint lint", () => {
  const mockStylelintPath = join(
    import.meta.dirname,
    "mock/stylelint-recorder",
  );

  beforeEach(() => {
    // Clear recorded calls before each test
    const mock = require(mockStylelintPath);

    mock._reset();
  });

  it("should lint one file", async () => {
    const compiler = pack("lint-one", {
      configFile: null,
      stylelintPath: mockStylelintPath,
    });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasErrors(), false);

    const mock = require(mockStylelintPath);

    const [call] = mock._calls;

    assert.strictEqual(call.cache, false);
    assert.strictEqual(
      call.cacheLocation,
      "node_modules/.cache/diagnostics-webpack-plugin/.stylelintcache",
    );
    assert.strictEqual(call.configFile, null);
    assert.strictEqual(call.quietDeprecationWarnings, true);
    assert.strictEqual(call.files.length, 1);
    assert.match(call.files[0], /test\.scss$/u);
  });

  it("should lint two files", async () => {
    const compiler = pack("lint-two", {
      configFile: null,
      stylelintPath: mockStylelintPath,
    });
    const stats = await compiler.runAsync();
    assert.strictEqual(stats.hasErrors(), false);

    const mock = require(mockStylelintPath);

    const [call] = mock._calls;

    assert.strictEqual(call.cache, false);
    assert.strictEqual(
      call.cacheLocation,
      "node_modules/.cache/diagnostics-webpack-plugin/.stylelintcache",
    );
    assert.strictEqual(call.configFile, null);
    assert.strictEqual(call.quietDeprecationWarnings, true);
    assert.strictEqual(call.files.length, 2);
    assert.match(call.files[0], /test[12]\.scss$/u);
    assert.match(call.files[1], /test[12]\.scss$/u);
  });
});
