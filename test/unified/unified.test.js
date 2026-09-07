import { join } from "node:path";

import { existsSync, readFileSync } from "fs-extra";

import LintPlugin from "../../src";

import pack from "./utils/pack";

const eslint = {
  use: "eslint",
  cache: false,
  overrideConfigFile: join(__dirname, "eslint.config.mjs"),
  ignore: false,
};
const stylelint = {
  use: "stylelint",
  cache: false,
  configFile: join(__dirname, ".stylelintrc"),
};
const linters = [eslint, stylelint];

describe("unified plugin", () => {
  it("should require at least one linter", () => {
    expect(() => new LintPlugin()).toThrow("options misses the property");
    expect(() => new LintPlugin({ linters: [] })).toThrow(
      "options.linters should be a non-empty array",
    );
  });

  it("should reject a linter it does not know", () => {
    expect(() => new LintPlugin({ linters: [{ use: "prettier" }] })).toThrow(
      "unknown linter 'prettier'",
    );
  });

  it("should reject an adapter that cannot lint", () => {
    expect(() => new LintPlugin({ linters: [{ use: { name: "x" } }] })).toThrow(
      "a `name` and a `create` function",
    );
  });

  it("should report the problems of every linter it runs", async () => {
    const compiler = pack("both", { linters });
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
    const compiler = pack("good", { linters });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(false);
  });

  it("should run a linter given no options of its own", async () => {
    const compiler = pack("both", {
      // The bundled config of this repository is the one ESLint finds here.
      exclude: "**/*.js",
      linters: [{ use: "eslint" }, stylelint],
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
      linters: [eslint, { ...stylelint, emitError: true }],
    });
    const stats = await compiler.runAsync();
    const [error] = stats.compilation.errors;

    expect(stats.compilation.errors).toHaveLength(1);
    expect(error.message).toEqual(expect.stringMatching("bad.scss"));
  });

  it("should run the same linter more than once", async () => {
    const compiler = pack("both", {
      linters: [
        { ...eslint, files: "bad.js" },
        { ...eslint, files: "index.js" },
      ],
    });
    const stats = await compiler.runAsync();
    const messages = stats.compilation.errors.map(({ message }) => message);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual(expect.stringMatching("bad.js"));
  });

  it("should run a linter shipped outside this package", async () => {
    const lintFiles = jest.fn().mockResolvedValue([{ file: "checked" }]);
    const compiler = pack("good", {
      linters: [
        {
          use: {
            name: "made-up",
            create: async () => ({
              lintFiles,
              getResults: async (results) => results,
              splitResults: (results) => ({ errors: results, warnings: [] }),
              getFormatter: async () => async () => "made up problem",
              cleanup: async () => {},
            }),
          },
        },
      ],
    });
    const stats = await compiler.runAsync();

    expect(lintFiles).toHaveBeenCalled();
    expect(stats.compilation.errors[0].message).toBe(
      "[made-up] made up problem",
    );
  });

  it("should fail the build when a shared failOnError is set", async () => {
    const compiler = pack("both", { failOnError: true, linters });

    await expect(compiler.runAsync()).rejects.toThrow("bad.js");
  });

  it("should join the reports of every linter into one output report", async () => {
    const filePath = join(__dirname, "outputs", "report.json");
    const compiler = pack("both", {
      outputReport: { filePath, formatter: "json" },
      linters,
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
