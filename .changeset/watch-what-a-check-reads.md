---
"diagnostics-webpack-plugin": patch
---

Watch the files a check reads rather than only the ones webpack builds, so that a change to a file outside the module graph — one `stylelint` globs, or one a `tsconfig.json` lists — rebuilds, and a file added or removed there is picked up.
