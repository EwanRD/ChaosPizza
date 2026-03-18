module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/**/*.js",
    "!<rootDir>/test/**",
    "!<rootDir>/node_modules/**",
    "!<rootDir>/jest.config.js",
    "!<rootDir>/coverage/**",
    "!<rootDir>/public/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};
