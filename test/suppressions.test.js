import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import { ESLint } from "eslint";

import pack from "./utils/pack.js";

const fixtures = join(import.meta.dirname, "fixtures");
const subdirectory = join(fixtures, "subdir");
const defaultLocation = join(fixtures, "eslint-suppressions.json");
const customLocation = join(fixtures, "custom-suppressions.json");

const violations = {
  "no-undef": { count: 1 },
  "no-unused-vars": { count: 1 },
  "no-var": { count: 1 },
};

/**
 * @param {string} filePath where to write the suppressions file
 * @param {object} suppressions the suppressed violations to record
 */
function writeSuppressions(filePath, suppressions) {
  writeFileSync(filePath, JSON.stringify(suppressions, null, 2));
}

// Suppressions landed in ESLint 9.24, as a CLI feature; the plugin drives the
// service itself below ESLint 10, which is where it became an option.
const [major, minor] = ESLint.version.split(".").map(Number);
const supported = major > 9 || (major === 9 && minor >= 24);

(supported ? describe : describe.skip)("suppressions", () => {
  afterEach(() => {
    rmSync(defaultLocation, { force: true });
    rmSync(customLocation, { force: true });
  });

  it("should report the errors when no suppressions file exists", async () => {
    const compiler = pack("suppressed-error", {
      applySuppressions: true,
      cwd: fixtures,
    });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), true);
  });

  it("should suppress the errors a suppressions file records", async () => {
    writeSuppressions(defaultLocation, { "suppressed-error.js": violations });

    const compiler = pack("suppressed-error", {
      applySuppressions: true,
      cwd: fixtures,
    });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should read the suppressions file named by suppressionsLocation", async () => {
    writeSuppressions(customLocation, { "suppressed-error.js": violations });

    const compiler = pack("suppressed-error", {
      applySuppressions: true,
      cwd: fixtures,
      suppressionsLocation: "custom-suppressions.json",
    });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasWarnings(), false);
    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should accept an absolute suppressionsLocation", async () => {
    writeSuppressions(customLocation, { "suppressed-error.js": violations });

    const compiler = pack("suppressed-error", {
      applySuppressions: true,
      cwd: fixtures,
      suppressionsLocation: customLocation,
    });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should record a nested file under the path relative to cwd", async () => {
    writeSuppressions(defaultLocation, {
      "subdir/suppressed-error.js": violations,
    });

    const compiler = pack("subdir/suppressed-error", {
      applySuppressions: true,
      cwd: fixtures,
    });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should reach a suppressions file outside cwd", async () => {
    writeSuppressions(defaultLocation, { "suppressed-error.js": violations });

    const compiler = pack("subdir/suppressed-error", {
      applySuppressions: true,
      cwd: subdirectory,
      suppressionsLocation: "../eslint-suppressions.json",
    });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), false);
  });

  it("should still report the errors the file does not record", async () => {
    writeSuppressions(defaultLocation, {
      "suppressed-error.js": { "no-var": { count: 1 } },
    });

    const compiler = pack("suppressed-error", {
      applySuppressions: true,
      cwd: fixtures,
    });

    const stats = await compiler.runAsync();
    const [error] = stats.compilation.errors;

    assert.strictEqual(stats.hasErrors(), true);
    assert.match(error.message, /no-undef/u);
    assert.doesNotMatch(error.message, /no-var/u);
  });

  it("should ignore a suppressionsLocation naming no file", async () => {
    const compiler = pack("suppressed-error", {
      applySuppressions: true,
      cwd: fixtures,
      suppressionsLocation: "custom-suppressions.json",
    });

    const stats = await compiler.runAsync();

    assert.strictEqual(stats.hasErrors(), true);
  });
});
