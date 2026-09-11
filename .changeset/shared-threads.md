---
"diagnostics-webpack-plugin": minor
---

`threads` is a shared option defaulting to `"auto"`, so every check spreads its work rather than holding the thread webpack builds on: a check that threads its own work is asked to, and one that cannot is run in a pool the plugin owns. Over three hundred modules that takes about a fifth off the build. It was Stylelint's alone and off by default; a check added later now gets it for nothing.
