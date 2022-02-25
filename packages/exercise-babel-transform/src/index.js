const babel = require('@babel/core');

const sourceCode = `new Array(5).fill(111)`;

const { code } = babel.transformSync(sourceCode, {
  filename: 'a.js',
  // plugins: [
  //   [
  //     '@babel/transform-runtime',
  //     {
  //       corejs: 3,
  //     },
  //   ],
  // ],
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: 'usage',
        targets: {
          browsers: 'Chrome 44',
        },
        corejs: 3,
      },
    ],
  ],
});

console.log(code);
