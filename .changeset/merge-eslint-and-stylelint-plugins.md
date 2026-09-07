---
"lint-webpack-plugin": major
---

Renamed from `eslint-webpack-plugin` and merged with `stylelint-webpack-plugin`: one plugin runs every linter through the `linters` option, `new LintPlugin({ linters: [{ use: "eslint" }, { use: "stylelint" }] })`. Errors are reported as webpack errors and warnings as webpack warnings, with `failOnError` and `failOnWarning` deciding whether the build fails; `stylelint` must be 17 or later. See the migration guides in the README.
