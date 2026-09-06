import { join } from "node:path";

import { existsSync, readFileSync } from "fs-extra";

import LintPlugin from "../../src";

import pack from "./utils/pack";

const eslint = {
  cache: false,
  overrideConfigFile: join(__dirname, "eslint.config.mjs"),
  ignore: false,
};
const stylelint = { cache: false, configFile: join(__dirname, ".stylelintrc") };

describe("unified plugin", () => {
  it("should require at least one linter", () => {
    expect(() => new LintPlugin()).toThrow("no linter enabled");
  });

  it("should report the problems of every linter it runs", async () => {
    const compiler = pack("both", { eslint, stylelint });
    const stats = await compiler.runAsync();
    const messages = [
      ...stats.compilation.errors,
      ...stats.compilation.warnings,
    ].map(({ message }) => message);

    expect(stats.hasErrors()).toBe(true);
    expect(stats.hasWarnings()).toBe(true);
    expect(messages.join("\n")).toEqual(expect.stringMatching("bad.js"));
    expect(messages.join("\n")).toEqual(expect.stringMatching("bad.scss"));
  });

  it("should lint nothing to report when every file is fine", async () => {
    const compiler = pack("good", { eslint, stylelint });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(false);
  });

  it("should run a linter enabled without options of its own", async () => {
    const compiler = pack("both", {
      eslint: true,
      stylelint,
      // The bundled config of this repository is the one ESLint finds here.
      exclude: "**/*.js",
    });
    const stats = await compiler.runAsync();

    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toEqual(
      expect.stringMatching("bad.scss"),
    );
  });

  it("should let a linter override a shared option", async () => {
    const compiler = pack("both", {
      emitError: false,
      eslint,
      stylelint: { ...stylelint, emitError: true },
    });
    const stats = await compiler.runAsync();
    const [error] = stats.compilation.errors;

    expect(stats.compilation.errors).toHaveLength(1);
    expect(error.message).toEqual(expect.stringMatching("bad.scss"));
  });

  it("should fail the build when a shared failOnError is set", async () => {
    const compiler = pack("both", { failOnError: true, eslint, stylelint });

    await expect(compiler.runAsync()).rejects.toThrow("bad.js");
  });

  it("should join the reports of every linter into one output report", async () => {
    const filePath = join(__dirname, "outputs", "report.json");
    const compiler = pack("both", {
      outputReport: { filePath, formatter: "json" },
      eslint,
      stylelint,
    });

    await compiler.runAsync();

    expect(existsSync(filePath)).toBe(true);

    const [eslintReport, stylelintReport] = readFileSync(filePath, "utf8")
      .split("\n")
      .map((report) => JSON.parse(report));

    expect(eslintReport).toMatchObject([
      { filePath: expect.stringContaining("bad.js") },
    ]);
    expect(stylelintReport).toMatchObject([
      { source: expect.stringContaining("bad.scss") },
    ]);
  });
});
