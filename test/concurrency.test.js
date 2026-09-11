import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";

import pack from "./utils/pack.js";

const require = createRequire(import.meta.url);
const eslintPath = join(import.meta.dirname, "mock/eslint-options");
const mock = () => require(eslintPath);
const given = async (options) => {
  await pack("error", { eslintPath, ...options }).runAsync();

  return mock()._calls[0];
};

describe("concurrency", () => {
  beforeEach(() => {
    mock()._reset();
    mock()._setVersion("10.0.0");
  });

  it("should ask an ESLint that threads for threads", async () => {
    assert.strictEqual((await given({})).concurrency, "auto");
  });

  it("should keep what the user asked for", async () => {
    assert.strictEqual((await given({ concurrency: 2 })).concurrency, 2);
  });

  it("should keep it off when the user turned it off", async () => {
    assert.strictEqual(
      (await given({ concurrency: "off" })).concurrency,
      "off",
    );
  });

  it("should not name the option to an ESLint that lacks it", async () => {
    mock()._setVersion("9.33.0");

    assert.ok(!("concurrency" in (await given({}))));
  });

  it("should name it to the release that gained it", async () => {
    mock()._setVersion("9.34.0");

    assert.strictEqual((await given({})).concurrency, "auto");
  });

  it("should leave an eslintrc config alone", async () => {
    const options = await given({ configType: "eslintrc" });

    assert.ok(!("concurrency" in options));
  });
});
