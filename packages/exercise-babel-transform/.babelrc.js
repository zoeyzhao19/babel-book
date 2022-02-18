module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '45',
        },
        useBuiltIns: 'usage', // or "entry" or "false"
        corejs: 3,
      },
    ],
  ],
};
