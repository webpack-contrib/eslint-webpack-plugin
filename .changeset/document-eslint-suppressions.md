---
"diagnostics-webpack-plugin": minor
---

Added ESLint bulk suppressions. `applySuppressions` and `suppressionsLocation` reach the `ESLint` class as they are on ESLint 10, and on ESLint 9.24 and later the plugin applies the suppressions itself, since ESLint only wires them into its CLI there.
