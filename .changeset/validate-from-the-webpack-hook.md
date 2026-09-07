---
"diagnostics-webpack-plugin": minor
---

Option validation now runs from webpack's `compiler.hooks.validate`, so a mistake is reported where webpack validates the rest of the configuration and `validate: false` turns it off. Where webpack predates the hook, in 5.106, the plugin validates as it did before.
