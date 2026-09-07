// Mock eslint that records the files it was asked to lint
const calls = [];

class ESLintMock {
  async lintFiles(files) {
    calls.push(files);
    return [];
  }

  async loadFormatter() {
    return { format: (results) => JSON.stringify(results) };
  }
}

ESLintMock.version = "9";

module.exports = {
  ESLint: ESLintMock,
  loadESLint: async () => ESLintMock,
  _calls: calls,
  _reset: () => {
    calls.length = 0;
  },
};
