module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
      },
    ],
  ],
  plugins: [
    [
      require.resolve('@babel/plugin-proposal-decorators'),
      { version: '2023-05', emitMetadata: true },
    ],
  ],
  overrides: [
    {
      // This tells Babel: "When looking at Vue files, do not look for JSX"
      test: /\.vue$/,
      presets: [
        [require.resolve('@babel/preset-typescript'), { allExtensions: false, isTSX: false }],
      ],
    },
    {
      // This handles your standard TypeScript files
      test: /\.ts$/,
      presets: [
        [require.resolve('@babel/preset-typescript'), { allExtensions: false, isTSX: false }],
      ],
    },
  ],
}
