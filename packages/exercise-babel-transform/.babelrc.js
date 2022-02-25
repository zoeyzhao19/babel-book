module.exports = {
  plugins: [
    [
      '@babel/transform-runtime',
      {
        corejs: 3,
      },
    ],
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '44',
        },
        useBuiltIns: 'entry', // or "entry" or "false"
        corejs: 3,
      },
    ],
  ],
};
