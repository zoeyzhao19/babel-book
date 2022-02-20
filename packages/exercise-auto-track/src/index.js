const { transformFromAstSync, transformFileSync } = require('@babel/core');
const parser = require('@babel/parser');
const autoTrackPlugin = require('./plugins/auto-track-plugin');
const path = require('path');

function transformMethod1() {
  const fs = require('fs');
  const sourceCode = fs.readFileSync(path.resolve(__dirname, './sourceCode.js'), {
    encoding: 'utf-8',
  });
  const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous',
  });
  const { code } = transformFromAstSync(ast, sourceCode, {
    plugins: [
      [
        autoTrackPlugin,
        {
          trackerPath: 'tracker',
        },
      ],
    ],
  });
  console.log('result from method1');
  console.log(code);
}

function transformMethod2() {
  const { code } = transformFileSync(path.resolve(__dirname, './sourceCode.js'), {
    plugins: [
      [
        autoTrackPlugin,
        {
          trackerPath: 'tracker',
        },
      ],
    ],
    parserOpts: {
      sourceType: 'unambiguous',
    },
  });
  console.log('result from method2');
  console.log(code);
}
transformMethod2();
