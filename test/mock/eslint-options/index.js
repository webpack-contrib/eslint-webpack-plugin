// Mock eslint that records the options it was constructed with
const calls = [];

class ESLintMock {
  constructor(options) {
    calls.push(options);
  }

  async lintFiles() {
    return [];
  }

  async loadFormatter() {
    return { format: (results) => JSON.stringify(results) };
  }
}

ESLintMock.version = "10.0.0";

module.exports = {
  ESLint: ESLintMock,
  loadESLint: async () => ESLintMock,
  _calls: calls,
  _setVersion: (version) => {
    ESLintMock.version = version;
  },
  _reset: () => {
    calls.length = 0;
  },
};
