---
"diagnostics-webpack-plugin": major
---

Renamed from `eslint-webpack-plugin` and merged with `stylelint-webpack-plugin`: one plugin runs every linter through the `checks` option, `new DiagnosticsPlugin({ checks: [{ use: "eslint" }, { use: "stylelint" }] })`. Errors are reported as webpack errors and warnings as webpack warnings, with `reportAs` deciding what each is reported as; `stylelint` must be 17 or later. See the migration guides in the README.
