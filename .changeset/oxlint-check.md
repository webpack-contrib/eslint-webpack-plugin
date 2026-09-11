---
"diagnostics-webpack-plugin": minor
---

Add an `oxlint` check, which lints the files webpack builds with [oxlint](https://oxc.rs/docs/guide/usage/linter.html) and reports what it finds at oxlint's own severities. Run it with `{ use: "oxlint" }`; `oxlint >= 1` is an optional peer.
