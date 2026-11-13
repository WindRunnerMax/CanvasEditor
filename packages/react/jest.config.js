module.exports = {
  testMatch: ["<rootDir>/test/**/*.test.ts"],
  transform: {
    "\\.ts$": ["ts-jest", { tsconfig: { module: "commonjs" } }],
  },
};
