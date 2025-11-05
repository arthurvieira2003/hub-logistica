module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.{js,jsx}", "**/*.{test,spec}.{js,jsx}"],
  collectCoverageFrom: [
    "public/javascripts/**/*.js",
    "!public/javascripts/**/*.test.js",
    "!public/javascripts/**/*.spec.js",
    "!public/javascripts/**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testTimeout: 10000,
  verbose: true,
};
