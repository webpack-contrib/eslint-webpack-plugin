---
"diagnostics-webpack-plugin": major
---

Rewritten as ECMAScript modules. The package is now `"type": "module"` and declares an `exports` field, shipping an ESM build next to a CommonJS one, so `import DiagnosticsPlugin from "diagnostics-webpack-plugin"` and `require("diagnostics-webpack-plugin")` both keep working.
