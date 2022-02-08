const { transformFileSync } = require('@babel/core');
const path = require('path');
const insertParametersPlugin = require('./plugins/params-insert-plugin.js');

const dirname = path.resolve(path.dirname(''));
const code = transformFileSync(path.join(dirname, './sourceCode.js'), {
  plugins: [insertParametersPlugin],
  parserOpts: {
    sourceType: 'unambiguous',
    plugins: ['jsx'],
  },
});

console.log(code);
