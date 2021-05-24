class ESLintMock {
  // Disabled because these are simplified mock methods.
  // eslint-disable-next-line class-methods-use-this
  async lintFiles() {
    return [
      {
        filePath: "",
        messages: [
          {
            ruleId: "no-undef",
            severity: 2,
            message: "Fake error",
            line: 1,
            column: 11,
          },
        ],
        errorCount: 2,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        source: "",
      },
    ];
  }
  // eslint-disable-next-line class-methods-use-this
  async loadFormatter() {
    return {
      format(results) {
        return JSON.stringify(results);
      },
    };
  }
}

module.exports = {
  ESLint: ESLintMock,
};
