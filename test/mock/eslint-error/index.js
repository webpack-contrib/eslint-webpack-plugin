// Mock eslint whose linting always throws, to check the plugin reports it
class ESLintMock {
  async lintFiles() {
    throw new Error("Oh no!");
  }
}

ESLintMock.version = "9";

module.exports = {
  ESLint: ESLintMock,
  loadESLint: async () => ESLintMock,
};
