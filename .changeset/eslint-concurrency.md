---
"diagnostics-webpack-plugin": minor
---

Ask ESLint for `concurrency: "auto"` unless told otherwise, so a lint does not hold the thread webpack builds on. Over three hundred modules that is about fifteen per cent off the build and a second of blocking gone. It is only asked for where the loaded ESLint knows the option, 9.34.0 and above under flat config.
