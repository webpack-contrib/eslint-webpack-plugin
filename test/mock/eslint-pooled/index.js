// Mock eslint that answers with one error per file, naming the thread it ran
// on: zero is webpack's own, anything else is a worker of the pool.
const { threadId } = require("node:worker_threads");

class ESLintMock {
  async lintFiles(files) {
    return (Array.isArray(files) ? files : [files]).map((filePath) => ({
      filePath,
      messages: [
        {
          ruleId: "pooled-rule",
          severity: 2,
          message: `linted on thread ${threadId}`,
          line: 1,
          column: 1,
        },
      ],
      suppressedMessages: [],
      errorCount: 1,
      warningCount: 0,
      fatalErrorCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      usedDeprecatedRules: [],
    }));
  }

  async loadFormatter() {
    return { format: (results) => JSON.stringify(results) };
  }
}

// Below the release that threads a lint itself, so the plugin pools it.
ESLintMock.version = "9.33.0";

module.exports = {
  ESLint: ESLintMock,
  loadESLint: async () => ESLintMock,
};
