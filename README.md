<div align="center">
  <a href="https://github.com/eslint/eslint"><img width="160" height="160" src="https://cdn.worldvectorlogo.com/logos/eslint.svg"></a>
  <a href="https://github.com/stylelint/stylelint"><img width="160" height="160" src="https://cdn.worldvectorlogo.com/logos/stylelint.svg"></a>
  <a href="https://github.com/webpack/webpack"><img width="160" height="160" src="https://webpack.js.org/assets/icon-square-big.svg"></a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![discussion][discussion]][discussion-url]
[![size][size]][size-url]

# diagnostics-webpack-plugin

> This plugin only supports webpack 5 and Node.js `>= 22.12.0`.

This plugin runs linters, type checkers and other diagnostic tools over your sources during the webpack build and reports what they find as webpack errors and warnings.

It replaces `eslint-webpack-plugin` and `stylelint-webpack-plugin`: one plugin, one place to configure how problems are reported, and one pass over your project. Today it runs [`ESLint`](https://eslint.org/) and [`Stylelint`](https://stylelint.io/); more linters and diagnostic tools are meant to be added the same way.

## Getting Started

To begin, you'll need to install `diagnostics-webpack-plugin`:

```console
npm install diagnostics-webpack-plugin --save-dev
```

or

```console
yarn add -D diagnostics-webpack-plugin
```

or

```console
pnpm add -D diagnostics-webpack-plugin
```

> [!NOTE]
>
> Install the linters you want to run as well — the plugin only requires the ones you enable. It supports `eslint >= 9` and `stylelint >= 17`:

```console
npm install eslint stylelint --save-dev
```

Then add the plugin to your webpack configuration and enable a check for each language you want inspected:

```js
import DiagnosticsPlugin from "diagnostics-webpack-plugin";

export default {
  // ...
  plugins: [
    new DiagnosticsPlugin({
      checks: [
        { use: "eslint", extensions: ["js", "mjs"] },
        { use: "stylelint", extensions: ["css", "scss"] },
      ],
    }),
  ],
  // ...
};
```

The package ships an ECMAScript build next to a CommonJS one, so a CommonJS configuration works just as well:

```js
const DiagnosticsPlugin = require("diagnostics-webpack-plugin");
```

## Options

The plugin options have three layers:

| Layer                     | Where it goes                    | What it covers                                                                         |
| :------------------------ | :------------------------------- | :------------------------------------------------------------------------------------- |
| [Plugin](#plugin-options) | Top level only                   | How the plugin schedules its work, for every check at once.                            |
| [Shared](#shared-options) | Top level or in a `checks` entry | Which files are linted and how problems are reported. An entry overrides what it sets. |
| Check                     | In a `checks` entry              | Options only that tool understands, plus everything its own Node.js API accepts.       |

The options are checked against their schema from webpack's own [`validate`](https://webpack.js.org/configuration/other-options/#validate) hook, so a mistake is reported when webpack validates the rest of your configuration, and `validate: false` turns the check off along with webpack's.

Every check to run is an entry in `checks`, named by its `use`. The list may name the same tool more than once, so one instance can inspect two file sets under different configurations.

```js
new DiagnosticsPlugin({
  // Plugin options
  context: "src",
  // Shared options, every check uses them unless it says otherwise
  reportAs: "warning", // report every check's results as warnings
  exclude: ["node_modules", "vendor"],
  // The checks to run, each with the options only it understands
  checks: [
    { use: "eslint", extensions: ["js", "ts"], fix: true },
    { use: "stylelint", extensions: ["css", "scss"], threads: true },
  ],
});
```

### Plugin options

#### `context`

- Type:

```ts
type context = string;
```

- Default: `compiler.context`

Base directory for linting. Every relative `files` and `exclude` pattern is resolved against it.

#### `lintDirtyModulesOnly`

- Type:

```ts
type lintDirtyModulesOnly = boolean;
```

- Default: `false`

Lint only changed files, skipping the initial lint on build start.

### Shared options

These can be set at the top level, where they apply to every check, or inside one check, where they apply to that check alone.

#### `cache`

- Type:

```ts
type cache = boolean;
```

- Default: `true`

The cache is enabled by default to decrease execution time.

#### `cacheLocation`

- Type:

```ts
type cacheLocation = string;
```

- Default: `node_modules/.cache/diagnostics-webpack-plugin/.<tool>cache`

Specify the path to the cache location. Can be a file or a directory.

#### `files`

- Type:

```ts
type files = string | string[];
```

- Default: `options.context`

Specify directories, files, or globs. Must be relative to `options.context`.
Directories are traversed recursively looking for files matching `options.extensions`.
File and glob patterns ignore `options.extensions`.

#### `extensions`

- Type:

```ts
type extensions = string | string[];
```

- Default: `'js'` for ESLint, `['css', 'scss', 'sass']` for Stylelint

Specify file extensions that should be checked.

#### `exclude`

- Type:

```ts
type exclude = string | string[];
```

- Default: `'node_modules'`, plus `output.path` for Stylelint

Specify the files/directories to exclude. Must be relative to `options.context`.

#### `resourceQueryExclude`

- Type:

```ts
type resourceQueryExclude = RegExp | RegExp[];
```

- Default: `[]`

Specify the resource query to exclude. Only affects checks that read the module graph, such as ESLint.

#### `fix`

- Type:

```ts
type fix = boolean;
```

- Default: `false`

Will enable the autofix feature of the tool.

**Be careful: this option will modify source files.**

#### `formatter`

- Type:

```ts
type formatter = string | ((results: LintResult[]) => string);
```

- Default: the tool's own default formatter

Accepts the name of a formatter the tool ships, or a function that receives its results and returns the output as a string.

See the [ESLint formatters](https://eslint.org/docs/user-guide/formatters/) and the [Stylelint `formatter` option](https://stylelint.io/user-guide/usage/options#formatter).

### Errors and warnings

Every check reports its errors as webpack errors and its warnings as webpack warnings, which is what fails the build. `reportAs` overrides that.

#### `reportAs`

- Type:

```ts
type reportAs = Severity | { errors?: Severity; warnings?: Severity };
type Severity = "error" | "warning" | false;
```

- Default: unset — each result stays at the severity the check gave it

What a check reports its results as. One value covers its errors and its warnings alike; an object sets them apart, and a severity the object leaves out keeps its own:

| Value                   | Effect                                                     |
| :---------------------- | :--------------------------------------------------------- |
| unset                   | Errors fail the build, warnings do not.                    |
| `"error"`               | Everything fails the build, warnings included.             |
| `"warning"`             | Nothing fails the build; errors are reported as warnings.  |
| `false`                 | Nothing is reported. An `outputReport` is still written.   |
| `{ warnings: false }`   | The errors alone, still failing the build.                 |
| `{ warnings: "error" }` | Warnings fail the build too, and errors keep failing it.   |
| `{ errors: "warning" }` | Errors stop failing the build, and warnings stay warnings. |

```js
new DiagnosticsPlugin({
  reportAs: { warnings: false }, // the errors alone
  checks: [{ use: "eslint" }],
});
```

#### `outputReport`

- Type:

```ts
type outputReport =
  | boolean
  | {
      filePath?: string | undefined;
      formatter?: (string | ((results: LintResult[]) => string)) | undefined;
    };
```

- Default: `false`

Write the results to a file, for example a checkstyle xml file for use for reporting on Jenkins CI.

- `filePath`: path to the output report file, relative to `output.path` unless absolute.
- `formatter`: a different `formatter` for the output file; the default/configured formatter is used when none is passed in.

Set at the top level, every check appends its report to the same file. Set it inside a `checks` entry to give that check a file of its own.

```js
new DiagnosticsPlugin({
  checks: [
    {
      use: "eslint",
      outputReport: { filePath: "eslint.json", formatter: "json" },
    },
    {
      use: "stylelint",
      outputReport: { filePath: "stylelint.json", formatter: "json" },
    },
  ],
});
```

## ESLint

Run with `{ use: "eslint" }`. It lints the files webpack builds, so only the modules that end up in the bundle are checked.

Alongside the shared options you can pass any [ESLint Node.js API option](https://eslint.org/docs/latest/integrate/nodejs-api#-new-eslintoptions) — they are handed to the `ESLint` class as they are.

### `configType`

- Type:

```ts
type configType = "flat" | "eslintrc";
```

- Default: `flat`

Specify the type of configuration to use with ESLint.

- `flat` is the current standard configuration format.
- `eslintrc` is the legacy configuration format and has been officially deprecated.

The new configuration format is explained in its [own documentation](https://eslint.org/docs/latest/use/configure/configuration-files).

### `eslintPath`

- Type:

```ts
type eslintPath = string;
```

- Default: `eslint`

Path to the `eslint` instance that will be used for linting.

If the `eslintPath` is a folder like the official ESLint, or you specify a `formatter` option, you don't have to install `eslint`.

### Suppressions

[Bulk suppressions](https://eslint.org/docs/latest/use/suppressions) are supported: enable ESLint's own `applySuppressions`, and point `suppressionsLocation` at the file if it is not the default `eslint-suppressions.json`.

```js
new DiagnosticsPlugin({
  checks: [{ use: "eslint", applySuppressions: true }],
});
```

> [!IMPORTANT]
>
> ESLint resolves the suppressions file, and every path recorded inside it, against its own `cwd` — not against the plugin's [`context`](#context). Where the two differ, pass `cwd` to the check as well:
>
> ```js
> new DiagnosticsPlugin({
>   context: "src",
>   checks: [
>     { use: "eslint", applySuppressions: true, cwd: import.meta.dirname },
>   ],
> });
> ```

Suppressions need ESLint 9.24 or later. ESLint 10 takes both options itself; below that they reach its CLI alone, so the plugin applies the suppressions after linting instead — the same file, the same paths, the same result.

## Stylelint

Run with `{ use: "stylelint" }`, and requires `stylelint >= 17`. It lints every file matching `files` and `extensions` on disk, whether or not webpack imported it, so a stylesheet nothing imports yet is still checked.

Alongside the shared options you can pass any [Stylelint option](https://stylelint.io/user-guide/usage/node-api#options) — they are handed to `stylelint.lint()` as they are.

### `stylelintPath`

- Type:

```ts
type stylelintPath = string;
```

- Default: `stylelint`

Path to the `stylelint` instance that will be used for linting.

### `threads`

- Type:

```ts
type threads = boolean | number;
```

- Default: `false`

Set to `true` for an auto-selected pool size based on the number of CPUs. Set to a number greater than 1 to set an explicit pool size.

Set to `false`, `1`, or less to disable and only run in the main process.

## Adding a check

A `use` may also be an adapter of its own rather than a built-in name, so a check can ship as its own package without an entry in this one:

```js
new DiagnosticsPlugin({
  checks: [
    { use: require("diagnostics-webpack-plugin-typescript"), strict: true },
  ],
});
```

Such an adapter is an object with a `name`, and a `create` returning the five functions the plugin drives it through — what to lint, what came back, which results are errors and which warnings, how to format them, and what to release afterwards. It splits its results by their own severity and nothing else; [`reportAs`](#reportas) is applied to what it returns:

```js
module.exports = {
  name: "made-up",
  // "modules" lints the files webpack built, "glob" every file matching `files`
  filesSource: "glob",
  // Merged under the options the user passes, and under the shared options
  defaults: { extensions: ["ts"] },
  async create({ key, options, compilation }) {
    return {
      lintFiles: async (files) => runTheTool(files),
      getResults: async (results) => results,
      splitResults: (results) => ({ errors: results, warnings: [] }),
      getFormatter: async (formatter) => async (results) => format(results),
      cleanup: async () => {},
    };
  },
};
```

`label`, `filesSource`, `defaults`, `defaultExclude` and `schema` are optional; the plugin fills in the defaults of a module-scanning check that excludes `node_modules`.

## Migrating

### From `eslint-webpack-plugin`

Move the options you were passing into a `checks` entry:

```diff
-const ESLintPlugin = require("eslint-webpack-plugin");
+const DiagnosticsPlugin = require("diagnostics-webpack-plugin");

 module.exports = {
   plugins: [
-    new ESLintPlugin({ extensions: ["js"], fix: true }),
+    new DiagnosticsPlugin({
+      checks: [{ use: "eslint", extensions: ["js"], fix: true }],
+    }),
   ],
 };
```

`emitError`, `emitWarning`, `failOnError` and `failOnWarning` are one [`reportAs`](#reportas) option now, because reporting a result as a webpack error is what fails the build — there is nothing left for a second option to say:

| Was                                         | Is                                |
| :------------------------------------------ | :-------------------------------- |
| `quiet: true`, `emitWarning: false`         | `reportAs: { warnings: false }`   |
| `emitError: false`                          | `reportAs: { errors: false }`     |
| `emitError: false` and `emitWarning: false` | `reportAs: false`                 |
| `failOnError: true`                         | the default                       |
| `failOnError: false`                        | `reportAs: "warning"`             |
| `failOnWarning: true`                       | `reportAs: { warnings: "error" }` |

The build is no longer aborted from inside the plugin: a result reported as a webpack error fails the build the way every other webpack error does, and the assets are still written.

The shared options — `context`, `files`, `exclude`, `reportAs` and the rest of [Errors and warnings](#errors-and-warnings) — may stay at the top level instead. Everything else behaves as it did, and the default `cacheLocation` moved to `node_modules/.cache/diagnostics-webpack-plugin/.eslintcache`.

### From `stylelint-webpack-plugin`

Move the options you were passing into a `checks` entry:

```diff
-const StylelintPlugin = require("stylelint-webpack-plugin");
+const DiagnosticsPlugin = require("diagnostics-webpack-plugin");

 module.exports = {
   plugins: [
-    new StylelintPlugin({ extensions: ["css"], threads: true }),
+    new DiagnosticsPlugin({
+      checks: [{ use: "stylelint", extensions: ["css"], threads: true }],
+    }),
   ],
 };
```

Three things changed beyond the option shape:

- **Stylelint 17 or later is required.** `stylelint-webpack-plugin` accepted `13` through `17`; the merged plugin drops the older majors rather than carrying their compatibility branches forward. Stylelint 17 itself needs Node `>= 20.19`.
- **Errors and warnings are no longer swapped.** Errors are reported as webpack errors and warnings as webpack warnings, unless [`reportAs`](#reportas) names one severity for all of them. Previously `failOnError: false` turned errors into warnings, and `failOnWarning: true` turned warnings into errors.
- **The build is no longer aborted from inside the plugin.** A result reported as a webpack error fails the build the way every other webpack error does, and the assets are still written.

The default `cacheLocation` moved to `node_modules/.cache/diagnostics-webpack-plugin/.stylelintcache`.

### Running both

The two plugins become one instance, and options they had in common are written once:

```diff
 module.exports = {
   plugins: [
-    new ESLintPlugin({ context: "src", failOnError: true, extensions: ["js"] }),
-    new StylelintPlugin({ context: "src", failOnError: true, extensions: ["css"] }),
+    new DiagnosticsPlugin({
+      context: "src",
+      checks: [
+        { use: "eslint", extensions: ["js"] },
+        { use: "stylelint", extensions: ["css"] },
+      ],
+    }),
   ],
 };
```

## Changelog

[Changelog](CHANGELOG.md)

## Contributing

We welcome all contributions!

If you're new here, please take a moment to review our contributing guidelines.

[CONTRIBUTING](https://github.com/webpack/diagnostics-webpack-plugin?tab=contributing-ov-file#contributing)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/diagnostics-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/diagnostics-webpack-plugin
[node]: https://img.shields.io/node/v/diagnostics-webpack-plugin.svg
[node-url]: https://nodejs.org
[tests]: https://github.com/webpack/diagnostics-webpack-plugin/workflows/diagnostics-webpack-plugin/badge.svg
[tests-url]: https://github.com/webpack/diagnostics-webpack-plugin/actions
[cover]: https://codecov.io/gh/webpack/diagnostics-webpack-plugin/branch/main/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack/diagnostics-webpack-plugin
[discussion]: https://img.shields.io/github/discussions/webpack/webpack
[discussion-url]: https://github.com/webpack/webpack/discussions
[size]: https://packagephobia.now.sh/badge?p=diagnostics-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=diagnostics-webpack-plugin
