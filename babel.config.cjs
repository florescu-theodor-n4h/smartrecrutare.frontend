module.exports = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: 'defaults',
        modules: false,
      },
    ],
  ],

  plugins: [
    [
      require.resolve('@babel/plugin-proposal-decorators'),
      {
        version: '2023-05',
        emitMetadata: true,
      },
    ],
  ],

  overrides: [
    {
      test: /\.[cm]?tsx?$/,
      presets: [
        [
          require.resolve('@babel/preset-typescript'),
          {
            allExtensions: false,
            isTSX: false,
            allowDeclareFields: true,
          },
        ],
      ],
    },
  ],
}
