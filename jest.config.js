export default {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*"],
  testEnvironment: "node",
  testTimeout: 60000,
  transformIgnorePatterns: ["node_modules/(?!(arrify)/)"],
};
