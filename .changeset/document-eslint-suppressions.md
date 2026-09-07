---
"lint-webpack-plugin": patch
---

Documented ESLint bulk suppressions. `applySuppressions` and `suppressionsLocation` reach the `ESLint` class through the usual pass-through and need ESLint 10, which is where they became constructor options.
