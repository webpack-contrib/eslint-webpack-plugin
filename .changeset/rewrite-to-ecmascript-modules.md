---
"lint-webpack-plugin": major
---

Rewritten as ECMAScript modules. The package is now `"type": "module"` and declares an `exports` field, shipping an ESM build next to a CommonJS one, so `import LintPlugin from "lint-webpack-plugin"` and `require("lint-webpack-plugin")` both keep working.
