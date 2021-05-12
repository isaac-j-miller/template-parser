const { defaults: tsjPreset } = require("ts-jest/presets");
let testRegex = ["(/__tests__/.*|\\.test)\\.[jt]sx?$"];
let testPathIgnorePatterns = [".*\\.intgr\\.test.*"];
module.exports = {
  automock: false,
  clearMocks: true,
  collectCoverage: false,
  testEnvironment: "node",
  testRegex,
  collectCoverageFrom: ["**/*.ts", "!**/node_modules/**"],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["\\\\node_modules\\\\"],
  testPathIgnorePatterns,
  roots: [
    "<rootDir>/src",
  ],
  transform: {
    ...tsjPreset.transform,
  },
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json",
    },
    // TODO fix this - globals need to be per test env
    window: {},
  },
};
