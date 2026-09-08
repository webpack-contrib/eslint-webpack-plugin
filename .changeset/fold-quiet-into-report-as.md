---
"diagnostics-webpack-plugin": major
---

`quiet` is gone: `reportAs` says what a check reports its results as, one value covering its errors and its warnings alike and an object setting them apart, so `quiet: true` is `reportAs: { warnings: false }`.
