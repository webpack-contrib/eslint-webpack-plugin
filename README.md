<div align="center">
  <a href="https://github.com/eslint/eslint"><img width="200" height="200" src="https://cdn.worldvectorlogo.com/logos/eslint.svg"></a>
  <a href="https://github.com/webpack/webpack"><img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg"></a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![discussion][discussion]][discussion-url]
[![size][size]][size-url]

# eslint-webpack-plugin

> This version of eslint-webpack-plugin only supports webpack 5. For the webpack 4, see the [2.x branch](https://github.com/webpack-contrib/eslint-webpack-plugin/tree/2.x).

This plugin uses [`ESlint`](https://eslint.org/) to find and fix problems in your JavaScript code during the Webpack build process.

## Getting Started

To begin, you'll need to install `eslint-webpack-plugin`:

```console
npm install eslint-webpack-plugin --save-dev
```

or

```console
yarn add -D eslint-webpack-plugin
```

or

```console
pnpm add -D eslint-webpack-plugin
```

> [!NOTE]
>
> You also need to install `eslint >= 8` from npm, if you haven't already:

```console
npm install eslint --save-dev
```

or

```console
yarn add -D eslint
```

or

```console
pnpm add -D eslint
```

Then add the plugin to your webpack configuration. For example:

```js
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  // ...
  plugins: [new ESLintPlugin(options)],
  // ...
};
```

## Options

You can pass [ESLint Node.js API options](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions).

> [!NOTE]
>
> The config option you provide will be passed to the `ESLint` class.
> This is a different set of options than what you'd specify in `package.json` or `eslint.config.js` (since ESLint v9.0.0, formerly `.eslintrc`).
> See the [ESlint docs](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions) for more details.

> [!WARNING]
>
> In eslint-webpack-plugin version 1 the options were passed to the now-deprecated [CLIEngine](https://eslint.org/docs/developer-guide/nodejs-api#cliengine).

### `cache`

- Type:

```ts
type cache = boolean;
```

- Default: `true`

The cache is enabled by default to decrease execution time.

### `cacheLocation`

- Type:

```ts
type cacheLocation = string;
```

- Default: `node_modules/.cache/eslint-webpack-plugin/.eslintcache`

Specify the path to the cache location. Can be a file or a directory.

### `configType`

- Type:

```ts
type configType = 'flat' | 'eslintrc';
```

- Default: `flat`

Specify the type of configuration to use with ESLint.

- `eslintrc` is the classic configuration format available in most ESLint versions.
- `flat` is the new format introduced in ESLint 8.21.0.

The new configuration format is explained in its [own documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new).

### `context`

- Type:

```ts
type context = string;
```

- Default: `compiler.context`

Base directory for linting.

### `eslintPath`

- Type:

```ts
type eslintPath = string;
```

- Default: `eslint`

Path to `eslint` instance that will be used for linting.

If the `eslintPath` is a folder like a official ESlint, or specify a `formatter` option, now you don't have to install `eslint`.

### `extensions`

- Type:

```ts
type extensions = string | Array<string>;
```

- Default: `'js'`

Specify file extensions that should be checked.

### `exclude`

- Type:

```ts
type exclude = string | Array<string>;
```

- Default: `'node_modules'`

Specify the files/directories to exclude. Must be relative to `options.context`.

### `resourceQueryExclude`

- Type:

```ts
type resourceQueryExclude = RegExp | Array<RegExp>;
```

- Default: `[]`

Specify the resource query to exclude.

### `files`

- Type:

```ts
type files = string | Array<string>;
```

- Default: `null`

Specify directories, files, or globs. Must be relative to `options.context`.
Directories are traversed recursively looking for files matching `options.extensions`.
File and glob patterns ignore `options.extensions`.

### `fix`

- Type:

```ts
type fix = boolean;
```

- Default: `false`

Will enable [ESLint autofix feature](https://eslint.org/docs/developer-guide/nodejs-api#-eslintoutputfixesresults).

**Be careful: this option will modify source files.**

### `formatter`

- Type:

```ts
type formatter = string| (
  results:  Array<import('eslint').ESLint.LintResult>,
  data?: import('eslint').ESLint.LintResultData | undefined
) => string
```

- Default: `'stylish'`

Accepts a function that receives an array of ESLint messages (object) as its argument and must return a string as output.

You can use official [ESlint formatters](https://eslint.org/docs/user-guide/formatters/).

### `lintDirtyModulesOnly`

- Type:

```ts
type lintDirtyModulesOnly = boolean;
```

- Default: `false`

Lint only changed files, skipping initial lint on build start.

### `threads`

- Type:

```ts
type threads = boolean | number;
```

- Default: `false`

Will run lint tasks across a thread pool. The pool size is automatic unless you specify a number.

### Errors and Warning

**By default the plugin will auto adjust error reporting depending on eslint errors/warnings counts.**

You can still force this behavior by using `emitError` **or** `emitWarning` options:

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

- Default: `true`

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
      formatter?:
        | (
            | string
            | ((
                results: Array<import('eslint').ESLint.LintResult>,
                data?: import('eslint').ESLint.LintResultData | undefined,
              ) => string)
          )
        | undefined;
    };
```

- Default: `false`

Write ESLint results to a file, for example a checkstyle xml file for use for reporting on Jenkins CI.

- filePath: Path to output report file (relative to output.path or absolute).
- formatter: You can pass in a different `formatter` for the output file.
  if none is passed in the default/configured formatter will be used.

## Changelog

[Changelog](CHANGELOG.md)

## Contributing

We welcome all contributions!

If you're new here, please take a moment to review our contributing guidelines.

[CONTRIBUTING](./.github/CONTRIBUTING.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/eslint-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/eslint-webpack-plugin
[node]: https://img.shields.io/node/v/eslint-webpack-plugin.svg
[node-url]: https://nodejs.org
[tests]: https://github.com/webpack-contrib/eslint-webpack-plugin/workflows/eslint-webpack-plugin/badge.svg
[tests-url]: https://github.com/webpack-contrib/eslint-webpack-plugin/actions
[cover]: https://codecov.io/gh/webpack-contrib/eslint-webpack-plugin/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/eslint-webpack-plugin
[discussion]: https://img.shields.io/github/discussions/webpack/webpack
[discussion-url]: https://github.com/webpack/webpack/discussions
[size]: https://packagephobia.now.sh/badge?p=eslint-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=eslint-webpack-plugin
