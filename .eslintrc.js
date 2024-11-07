module.exports = {
  parserOptions: {
    sourceType: "module",
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  overrides: [
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint", "simple-import-sort"],
      extends: ["plugin:@typescript-eslint/recommended"],
    },
    {
      files: ["*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["react", "react-hooks", "@typescript-eslint/eslint-plugin", "simple-import-sort"],
      extends: ["plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended"],
    },
  ],
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es2021: true,
  },
  ignorePatterns: ["node_modules", "build", "dist", "coverage", "public"],
  rules: {
    "semi": "error",
    "quote-props": ["error", "consistent-as-needed"],
    "arrow-parens": ["error", "as-needed"],
    "no-var": "error",
    "prefer-const": "error",
    "no-console": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
};
