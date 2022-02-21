const { transformFromAstSync } = require('@babel/core');
const parser = require('@babel/parser');
const autoI18nPlugin = require('./plugins/auto-i18n-plugin');
const path = require('path');
const fs = require('fs');

const sourceCode = fs.readFileSync(path.resolve(__dirname, './sourceCode.js'), {
  encoding: 'utf-8',
});
const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx'],
});
const { code } = transformFromAstSync(ast, sourceCode, {
  plugins: [
    [
      autoI18nPlugin,
      {
        root: 'src',
        outputDir: 'i18n',
      },
    ],
  ],
});
console.log(code);
