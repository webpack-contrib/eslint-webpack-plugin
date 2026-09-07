import assert from "node:assert/strict";
import { cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

import pack from "./utils/pack.js";

describe("autofix stop", () => {
  const entry = join(import.meta.dirname, "fixtures/nonfixable-clone.js");

  let changed = false;
  let watcher;

  before(async () => {
    cpSync(join(import.meta.dirname, "fixtures/nonfixable.js"), entry);
    const chokidar = (await import("chokidar")).default;

    watcher = chokidar.watch(entry);
    watcher.on("change", () => {
      changed = true;
    });
  });

  after(() => {
    watcher.close();
    rmSync(entry, { force: true, recursive: true });
  });

  it("should not change file if there are no fixable errors/warnings", async () => {
    const compiler = pack("nonfixable-clone", { fix: true });

    await compiler.runAsync();
    assert.strictEqual(changed, false);
  });
});
