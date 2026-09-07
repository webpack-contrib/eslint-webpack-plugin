import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import { parseFiles, parseFoldersToGlobs } from "../src/utils.js";

// `parseFoldersToGlobs` stats what it is given, so the fixtures have to exist.
const directory = join(import.meta.dirname, "fixtures");
const file = join(import.meta.dirname, "fixtures", "good.js");

describe("utils", () => {
  it("parseFiles should return relative files from context", () => {
    const [all, packageA, packageB] = parseFiles(
      ["**/*", "../package-a/src/**/", "../package-b/src/**/"],
      "main/src",
    );

    assert.ok(all.endsWith("main/src/**/*"));
    assert.ok(packageA.endsWith("main/package-a/src/**"));
    assert.ok(packageB.endsWith("main/package-b/src/**"));
  });

  it("parseFoldersToGlobs should return globs for folders", () => {
    assert.deepStrictEqual(parseFoldersToGlobs(directory, "js"), [
      `${directory}/**/*.js`,
    ]);
    assert.deepStrictEqual(parseFoldersToGlobs(`${directory}/`, "js"), [
      `${directory}/**/*.js`,
    ]);

    assert.deepStrictEqual(
      parseFoldersToGlobs(
        [directory, `${directory}/`, file],
        ["js", "cjs", "mjs"],
      ),
      [
        `${directory}/**/*.{js,cjs,mjs}`,
        `${directory}/**/*.{js,cjs,mjs}`,
        file,
      ],
    );

    assert.deepStrictEqual(parseFoldersToGlobs(directory), [`${directory}/**`]);
    assert.deepStrictEqual(parseFoldersToGlobs(`${directory}/`), [
      `${directory}/**`,
    ]);
  });

  it("parseFoldersToGlobs should return unmodified globs for globs (ignoring extensions)", () => {
    assert.deepStrictEqual(parseFoldersToGlobs("**.notjs", "js"), ["**.notjs"]);
  });
});
