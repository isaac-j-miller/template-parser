module.exports = {
  tabWidth: 2,
  singleQuote: false,
  trailingComma: "es5",
  semi: true,
  printWidth: 100,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: "avoid",
  endOfLine: "lf",
  overrides: [
    {
      files: "*.md",
      options: {
        proseWrap: "always",
      },
    },
  ],
};
