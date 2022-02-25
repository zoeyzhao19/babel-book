const { transformFromAstSync } = require('@babel/core');
const parser = require('@babel/parser');
const path = require('path');
const fs = require('fs');
const lintForDirectionPlugin = require('./plugins/for-direction-plugin');

const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), {
  encoding: 'utf-8',
});

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
});

transformFromAstSync(ast, sourceCode, {
  plugins: [lintForDirectionPlugin],
});
