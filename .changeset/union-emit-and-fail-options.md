---
"diagnostics-webpack-plugin": major
---

`emitError` and `emitWarning` are one `emit` option, and `failOnError` and `failOnWarning` one `failOn`. Each takes `"warning"`, `"error"` or `false`, naming the least severe result it takes in, so `"warning"` covers the errors above it. `emit` defaults to `"warning"` and `failOn` to `"error"`, or `false` in `development` mode. See the migration table in the README.
