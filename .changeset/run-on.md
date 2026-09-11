---
"diagnostics-webpack-plugin": minor
---

Add `runOn`, which runs the checks for a one-shot build only (`"build"`) or for a watch run only (`"watch"`). Left unset they run for both, as before. It covers every check at once; per-check control is not available yet.
