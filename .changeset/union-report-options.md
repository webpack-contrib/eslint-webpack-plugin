---
"diagnostics-webpack-plugin": major
---

`emitError`, `emitWarning`, `failOnError` and `failOnWarning` are one `reportAs` option taking `"error"`, `"warning"` or `false`: it says what a check reports its results as, and reporting one as a webpack error is what fails the build. Left unset each result keeps its own severity, `quiet` still drops the warnings, and the build is no longer aborted from inside the plugin. See the migration table in the README.
