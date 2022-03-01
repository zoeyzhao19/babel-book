const { transformFileSync } = require('@babel/core');
const path = require('path');

const { code } = transformFileSync(path.resolve(__dirname, './sourceCode.js'), {
  plugins: [['babel-plugin-macros']],
});

console.log(code);
