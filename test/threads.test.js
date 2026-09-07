import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import workerThreads from "node:worker_threads";

import pack from "./utils/pack.js";

describe("Multithread", () => {
  let workerCount;
  let originalWorker;

  beforeEach(() => {
    workerCount = 0;
    originalWorker = workerThreads.Worker;
    workerThreads.Worker = class TrackedWorker extends originalWorker {
      constructor(...args) {
        super(...args);
        workerCount++;
      }
    };
  });

  afterEach(() => {
    workerThreads.Worker = originalWorker;
  });

  it("should spawn worker threads with concurrency=2", async () => {
    const compiler = pack("good", { concurrency: 2 });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
    assert.ok(workerCount >= 2);
  });

  it("should not spawn worker threads with concurrency=off", async () => {
    const compiler = pack("good", { concurrency: "off" });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
    assert.strictEqual(workerCount, 0);
  });
});
