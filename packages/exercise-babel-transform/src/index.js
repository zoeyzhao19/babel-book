const babel = require('@babel/core');

const sourceCode = `new Array(5).fill(111)`;

const { code, map } = babel.transformSync(sourceCode, {
  filename: 'a.js',
  plugins: [],
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: 'usage',
        targets: {
          browsers: 'Chrome 45',
        },
        corejs: 3,
      },
    ],
  ],
});

console.log(code);
