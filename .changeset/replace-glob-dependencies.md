---
"diagnostics-webpack-plugin": patch
---

Replace `globby`, `micromatch` and `normalize-path` with `tinyglobby` and `picomatch`, and compile the file matchers once per check rather than on every module.
