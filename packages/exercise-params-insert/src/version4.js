import { transformFileSync } from '@babel/core';
import insertParametersPlugin from './plugins/params-insert-plugin.js';
import path from 'path';

const __dirname = path.resolve(path.dirname(''));
const code = transformFileSync(path.join(__dirname, 'src/sourceCode.js'), {
  plugins: [insertParametersPlugin],
  parserOpts: {
    sourceType: 'unambiguous',
    plugins: ['jsx'],
  },
});

console.log(code);
