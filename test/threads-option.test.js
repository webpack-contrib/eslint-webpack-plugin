import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";

import { countThreads, isTransferable } from "../src/threads.js";

import pack from "./utils/pack.js";

const require = createRequire(import.meta.url);
const eslintPath = join(import.meta.dirname, "mock/eslint-options");
const mock = () => require(eslintPath);
const given = async (options) => {
  await pack("error", { eslintPath, ...options }).runAsync();

  return mock()._calls[0];
};

describe("threads", () => {
  describe("counting", () => {
    it("should leave webpack a thread of its own", () => {
      assert.ok(countThreads("auto") >= 1);
      assert.strictEqual(countThreads("auto"), countThreads(undefined));
      assert.strictEqual(countThreads(true), countThreads("auto"));
    });

    it("should read a count as the count", () => {
      assert.strictEqual(countThreads(4), 4);
      assert.strictEqual(countThreads(2.7), 2);
    });

    it("should read anything falsy as webpack's own thread", () => {
      assert.strictEqual(countThreads(false), 1);
      assert.strictEqual(countThreads(0), 1);
      assert.strictEqual(countThreads(1), 1);
      assert.strictEqual(countThreads(-3), 1);
    });
  });

  describe("handing options to a worker", () => {
    it("should carry what a structured clone carries", () => {
      assert.ok(isTransferable({ cache: true, files: ["a", "b"] }));
      assert.ok(isTransferable([{ deep: { deeper: null } }]));
    });

    it("should refuse a function, however deeply it sits", () => {
      assert.ok(!isTransferable(() => {}));
      assert.ok(!isTransferable({ formatter: () => {} }));
      assert.ok(!isTransferable([{ nested: { formatter: () => {} } }]));
    });
  });

  describe("the eslint check", () => {
    beforeEach(() => {
      mock()._reset();
      mock()._setVersion("10.0.0");
    });

    it("should ask an ESLint that threads itself to do so", async () => {
      assert.strictEqual((await given({})).concurrency, "auto");
    });

    it("should pass a count through as a count", async () => {
      assert.strictEqual((await given({ threads: 2 })).concurrency, 2);
    });

    it("should say nothing when threading is off", async () => {
      assert.ok(!("concurrency" in (await given({ threads: false }))));
    });

    it("should leave an ESLint that cannot thread itself alone", async () => {
      mock()._setVersion("9.33.0");

      assert.ok(!("concurrency" in (await given({}))));
    });

    it("should ask the release that gained it", async () => {
      mock()._setVersion("9.34.0");

      assert.strictEqual((await given({})).concurrency, "auto");
    });

    it("should leave an eslintrc config alone", async () => {
      assert.ok(!("concurrency" in (await given({ configType: "eslintrc" }))));
    });

    it("should keep what was written against ESLint itself", async () => {
      assert.strictEqual(
        (await given({ concurrency: "off" })).concurrency,
        "off",
      );
    });
  });
});

describe("a check that cannot thread itself", () => {
  // More than a pool is started for, so that this drives the pool rather than
  // the batch too small to be worth one.
  const pooled = 70;
  const fixtures = join(import.meta.dirname, "fixtures");
  const modules = Array.from({ length: pooled }, (_, i) => `pooled-${i}.js`);

  before(() => {
    for (const name of modules) {
      writeFileSync(join(fixtures, name), "module.exports = 1;\n");
    }

    writeFileSync(
      join(fixtures, "pooled-entry.js"),
      `${modules.map((name) => `require("./${name}");`).join("\n")}\n`,
    );
  });

  after(() => {
    for (const name of [...modules, "pooled-entry.js"]) {
      rmSync(join(fixtures, name), { force: true });
    }
  });

  it("should be spread over a pool, and its results come back", async () => {
    const stats = await pack("pooled", {
      eslintPath: join(import.meta.dirname, "mock/eslint-pooled"),
      threads: 2,
    }).runAsync();

    assert.strictEqual(stats.hasErrors(), true);

    const [{ message }] = stats.compilation.errors;

    // Thread zero is the one webpack builds on, so anything else is the pool.
    const [, thread] = /linted on thread (\d+)/u.exec(message);

    assert.notStrictEqual(thread, "0");
  });
});
