module.exports = {
  moduleFileExtensions: ["js", "ts"],
  moduleDirectories: ["node_modules", "src", "test"],
  moduleNameMapper: {
    "src/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "\\.ts$": "ts-jest",
    "\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  collectCoverage: false,
  testMatch: ["<rootDir>/test/**/*.test.ts"],
};
