---
"diagnostics-webpack-plugin": minor
---

Add a `biome` check, which checks the files webpack builds with [Biome](https://biomejs.dev/) and reports what it finds at Biome's own severities. Run it with `{ use: "biome" }`, and `command: "check"` to add Biome's formatting diagnostics to the linter's; `@biomejs/biome >= 2` is an optional peer.
