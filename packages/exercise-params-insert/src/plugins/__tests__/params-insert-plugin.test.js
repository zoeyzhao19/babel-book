const pluginTester = require('babel-plugin-tester').default;
const insertParametersPlugin = require('../params-insert-plugin.js');

pluginTester({
  plugin: insertParametersPlugin,
  pluginName: 'insert params plugin',
  babelOptions: {
    parserOpts: {
      sourceType: 'unambiguous',
      plugins: ['jsx'],
    },
  },
  tests: {
    'console.xx前插入了CallExpression的AST': {
      code: `
        console.log(1);

        function func() {
            console.info(2);
        }

        export default class Class {
            say() {
                console.debug(3);
            }
            render() {
                return <div>{console.error(4)}</div>
            }
        }
        `,
      snapshot: true,
    },
    'simple test': { code: '"hello";', snapshot: true },
  },
});
