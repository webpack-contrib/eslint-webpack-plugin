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

# lint-webpack-plugin

> This plugin only supports webpack 5.

This plugin runs linters and diagnostic tools over your sources during the webpack build and reports what they find as webpack errors and warnings.

It replaces `eslint-webpack-plugin` and `stylelint-webpack-plugin`: one plugin, one place to configure how problems are reported, and one pass over your project. Today it runs [`ESLint`](https://eslint.org/) and [`Stylelint`](https://stylelint.io/); more linters and diagnostic tools are meant to be added the same way.

## Getting Started

To begin, you'll need to install `lint-webpack-plugin`:

```console
npm install lint-webpack-plugin --save-dev
```

or

```console
yarn add -D lint-webpack-plugin
```

or

```console
pnpm add -D lint-webpack-plugin
```

> [!NOTE]
>
> Install the linters you want to run as well — the plugin only requires the ones you enable. It supports `eslint >= 9` and `stylelint >= 17`:

```console
npm install eslint stylelint --save-dev
```

Then add the plugin to your webpack configuration and enable a linter for each language you want checked:

```js
const LintPlugin = require("lint-webpack-plugin");

module.exports = {
  // ...
  plugins: [
    new LintPlugin({
      eslint: { extensions: ["js", "mjs"] },
      stylelint: { extensions: ["css", "scss"] },
    }),
  ],
  // ...
};
```

## Options

The plugin options have three layers:

| Layer                     | Where it goes            | What it covers                                                                         |
| :------------------------ | :----------------------- | :------------------------------------------------------------------------------------- |
| [Plugin](#plugin-options) | Top level only           | How the plugin schedules its work, for every linter at once.                           |
| [Shared](#shared-options) | Top level or in a linter | Which files are linted and how problems are reported. A linter overrides what it sets. |
| Linter                    | In a linter              | Options only that linter understands, plus everything its own Node.js API accepts.     |

A linter runs when it is given options, or when it is set to `true` to run with its defaults. At least one linter has to be enabled.

```js
new LintPlugin({
  // Plugin options
  context: "src",
  // Shared options, every linter uses them unless it says otherwise
  failOnError: true,
  exclude: ["node_modules", "vendor"],
  // Linter options
  eslint: { extensions: ["js", "ts"], fix: true },
  stylelint: { extensions: ["css", "scss"], threads: true },
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

These can be set at the top level, where they apply to every linter, or inside one linter, where they apply to that linter alone.

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

- Default: `node_modules/.cache/lint-webpack-plugin/.<linter>cache`

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

Specify the resource query to exclude. Only affects linters that read the module graph, such as ESLint.

#### `fix`

- Type:

```ts
type fix = boolean;
```

- Default: `false`

Will enable the autofix feature of the linter.

**Be careful: this option will modify source files.**

#### `formatter`

- Type:

```ts
type formatter = string | ((results: LintResult[]) => string);
```

- Default: the linter's own default formatter

Accepts the name of a formatter the linter ships, or a function that receives the linter's results and returns the output as a string.

See the [ESLint formatters](https://eslint.org/docs/user-guide/formatters/) and the [Stylelint `formatter` option](https://stylelint.io/user-guide/usage/options#formatter).

### Errors and warnings

Every linter reports its errors as webpack errors and its warnings as webpack warnings. `emitError` and `emitWarning` choose what is reported at all, and `failOnError` and `failOnWarning` choose whether the build is failed over it.

#### `emitError`

- Type:

```ts
type emitError = boolean;
```

- Default: `true`

The errors found will always be emitted, to disable set to `false`.

#### `emitWarning`

- Type:

```ts
type emitWarning = boolean;
```

- Default: `true`

The warnings found will always be emitted, to disable set to `false`.

#### `failOnError`

- Type:

```ts
type failOnError = boolean;
```

- Default: `true`, `false` in `development` mode

Will cause the module build to fail if any errors are found, to disable set to `false`.

#### `failOnWarning`

- Type:

```ts
type failOnWarning = boolean;
```

- Default: `false`

Will cause the module build to fail if any warnings are found, if set to `true`.

#### `quiet`

- Type:

```ts
type quiet = boolean;
```

- Default: `false`

Will process and report errors only and ignore warnings, if set to `true`.

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

Set at the top level, every linter appends its report to the same file. Set it inside a linter to give that linter a file of its own.

```js
new LintPlugin({
  eslint: { outputReport: { filePath: "eslint.json", formatter: "json" } },
  stylelint: {
    outputReport: { filePath: "stylelint.json", formatter: "json" },
  },
});
```

## ESLint

Enabled with the `eslint` option. It lints the files webpack builds, so only the modules that end up in the bundle are checked.

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

## Stylelint

Enabled with the `stylelint` option, and requires `stylelint >= 17`. It lints every file matching `files` and `extensions` on disk, whether or not webpack imported it, so a stylesheet nothing imports yet is still checked.

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

## Migrating

### From `eslint-webpack-plugin`

Move the options you were passing into an `eslint` group:

```diff
-const ESLintPlugin = require("eslint-webpack-plugin");
+const LintPlugin = require("lint-webpack-plugin");

 module.exports = {
   plugins: [
-    new ESLintPlugin({ extensions: ["js"], fix: true }),
+    new LintPlugin({ eslint: { extensions: ["js"], fix: true } }),
   ],
 };
```

The shared options — `context`, `files`, `exclude`, `failOnError` and the rest of [Errors and warnings](#errors-and-warnings) — may stay at the top level instead. Everything else behaves as it did, and the default `cacheLocation` moved to `node_modules/.cache/lint-webpack-plugin/.eslintcache`.

### From `stylelint-webpack-plugin`

Move the options you were passing into a `stylelint` group:

```diff
-const StylelintPlugin = require("stylelint-webpack-plugin");
+const LintPlugin = require("lint-webpack-plugin");

 module.exports = {
   plugins: [
-    new StylelintPlugin({ extensions: ["css"], threads: true }),
+    new LintPlugin({ stylelint: { extensions: ["css"], threads: true } }),
   ],
 };
```

Three things changed beyond the option shape:

- **Stylelint 17 or later is required.** `stylelint-webpack-plugin` accepted `13` through `17`; the merged plugin drops the older majors rather than carrying their compatibility branches forward. Stylelint 17 itself needs Node `>= 20.19`.
- **Errors and warnings are no longer swapped.** Errors are reported as webpack errors and warnings as webpack warnings, whatever `failOnError` and `failOnWarning` say; those two now decide whether the build is failed, not how a problem is reported. Previously `failOnError: false` turned errors into warnings, and `failOnWarning: true` turned warnings into errors.
- **`failOnError` defaults to `false` in `development` mode**, matching the rest of the plugin, rather than being `true` everywhere.

The default `cacheLocation` moved to `node_modules/.cache/lint-webpack-plugin/.stylelintcache`.

### Running both

The two plugins become one instance, and options they had in common are written once:

```diff
 module.exports = {
   plugins: [
-    new ESLintPlugin({ context: "src", failOnError: true, extensions: ["js"] }),
-    new StylelintPlugin({ context: "src", failOnError: true, extensions: ["css"] }),
+    new LintPlugin({
+      context: "src",
+      failOnError: true,
+      eslint: { extensions: ["js"] },
+      stylelint: { extensions: ["css"] },
+    }),
   ],
 };
```

## Changelog

[Changelog](CHANGELOG.md)

## Contributing

We welcome all contributions!

If you're new here, please take a moment to review our contributing guidelines.

[CONTRIBUTING](https://github.com/webpack/lint-webpack-plugin?tab=contributing-ov-file#contributing)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/lint-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/lint-webpack-plugin
[node]: https://img.shields.io/node/v/lint-webpack-plugin.svg
[node-url]: https://nodejs.org
[tests]: https://github.com/webpack/lint-webpack-plugin/workflows/lint-webpack-plugin/badge.svg
[tests-url]: https://github.com/webpack/lint-webpack-plugin/actions
[cover]: https://codecov.io/gh/webpack/lint-webpack-plugin/branch/main/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack/lint-webpack-plugin
[discussion]: https://img.shields.io/github/discussions/webpack/webpack
[discussion-url]: https://github.com/webpack/webpack/discussions
[size]: https://packagephobia.now.sh/badge?p=lint-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=lint-webpack-plugin
