---
"diagnostics-webpack-plugin": major
---

`lintDirtyModulesOnly` is `lintOnStart`, inverted and defaulting to `true`. It says whether the first compilation lints every file it covers, and a build — which is nothing but a first compilation — now lints whatever it is set to, where `lintDirtyModulesOnly: true` used to leave a build silently unlinted.
