<div align="center">
  <a href="https://github.com/eslint/eslint"><img width="200" height="200" src="https://cdn.worldvectorlogo.com/logos/eslint.svg"></a>
  <a href="https://github.com/webpack/webpack"><img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg"></a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![chat][chat]][chat-url]
[![size][size]][size-url]

# eslint-webpack-plugin

> A ESLint plugin for webpack

## Install

```bash
npm install eslint-webpack-plugin --save-dev
```

**Note**: You also need to install `eslint` from npm, if you haven't already:

```bash
npm install eslint --save-dev
```

## Usage

In your webpack configuration:

```js
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  // ...
  plugins: [new ESLintPlugin(options)],
  // ...
};
```

## Options

You can pass [eslint options](http://eslint.org/docs/developer-guide/nodejs-api#cliengine).

Note that the config option you provide will be passed to the `CLIEngine`.
This is a different set of options than what you'd specify in `package.json` or `.eslintrc`.
See the [eslint docs](http://eslint.org/docs/developer-guide/nodejs-api#cliengine) for more detail.

### `context`

- Type: `String`
- Default: `compiler.context`

A string indicating the root of your files.

### `eslintPath`

- Type: `String`
- Default: `eslint`

Path to `eslint` instance that will be used for linting. If the `eslintPath` is a folder like a official eslint, or specify a `formatter` option. now you dont have to install `eslint`.

### `files`

- Type: `String|Array[String]`
- Default: `'.'`

Specify the files and/or directories to traverse. Must be relative to `options.context`.

### `fix`

- Type: `Boolean`
- Default: `false`

Will enable [ESLint autofix feature](http://eslint.org/docs/user-guide/command-line-interface#fix).

**Be careful: this option will change source files.**

### `formatter`

- Type: `String|Function`
- Default: `'stylish'`

Accepts a function that will have one argument: an array of eslint messages (object). The function must return the output as a string.

### `lintDirtyModulesOnly`

- Type: `Boolean`
- Default: `false`

Lint only changed files, skip lint on start.

### Errors and Warning

**By default the plugin will auto adjust error reporting depending on eslint errors/warnings counts.**
You can still force this behavior by using `emitError` **or** `emitWarning` options:

#### `emitError`

- Type: `Boolean`
- Default: `false`

Will always return errors, if set to `true`.

#### `emitWarning`

- Type: `Boolean`
- Default: `false`

Will always return warnings, if set to `true`.

#### `failOnError`

- Type: `Boolean`
- Default: `false`

Will cause the module build to fail if there are any errors, if set to `true`.

#### `failOnWarning`

- Type: `Boolean`
- Default: `false`

Will cause the module build to fail if there are any warnings, if set to `true`.

#### `quiet`

- Type: `Boolean`
- Default: `false`

Will process and report errors only and ignore warnings, if set to `true`.

#### `outputReport`

- Type: `Boolean|Object`
- Default: `false`

Write the output of the errors to a file, for example a checkstyle xml file for use for reporting on Jenkins CI.

The `filePath` is an absolute path or relative to the webpack config: `output.path`.
You can pass in a different `formatter` for the output file,
if none is passed in the default/configured formatter will be used.

## Changelog

[Changelog](CHANGELOG.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/eslint-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/eslint-webpack-plugin
[node]: https://img.shields.io/node/v/eslint-webpack-plugin.svg
[node-url]: https://nodejs.org
[deps]: https://david-dm.org/webpack-contrib/eslint-webpack-plugin.svg
[deps-url]: https://david-dm.org/webpack-contrib/eslint-webpack-plugin
[tests]: https://dev.azure.com/webpack-contrib/eslint-webpack-plugin/_apis/build/status/webpack-contrib.eslint-webpack-plugin?branchName=master
[tests-url]: https://dev.azure.com/webpack-contrib/eslint-webpack-plugin/_build/latest?definitionId=4&branchName=master
[cover]: https://codecov.io/gh/webpack-contrib/eslint-webpack-plugin/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/eslint-webpack-plugin
[chat]: https://badges.gitter.im/webpack/webpack.svg
[chat-url]: https://gitter.im/webpack/webpack
[size]: https://packagephobia.now.sh/badge?p=eslint-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=eslint-webpack-plugin
