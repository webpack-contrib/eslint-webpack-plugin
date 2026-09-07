import { join } from "node:path";
import { copySync, removeSync } from "fs-extra";

import pack from "./utils/pack";

describe("autofix stop", () => {
  const entry = join(import.meta.dirname, "fixtures/nonfixable-clone.js");

  let changed = false;
  let watcher;

  beforeAll(async () => {
    copySync(join(import.meta.dirname, "fixtures/nonfixable.js"), entry);
    const chokidar = (await import("chokidar")).default;

    watcher = chokidar.watch(entry);
    watcher.on("change", () => {
      changed = true;
    });
  });

  afterAll(() => {
    watcher.close();
    removeSync(entry);
  });

  it("should not change file if there are no fixable errors/warnings", async () => {
    const compiler = pack("nonfixable-clone", { fix: true });

    await compiler.runAsync();
    expect(changed).toBe(false);
  });
});
