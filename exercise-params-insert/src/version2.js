import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import types from '@babel/types';

/**
 * 在console中插入行列号
 */
const sourceCode = `
    console.log(1);

    function func() {
        console.info(2);
    }

    export default class Clazz {
        say() {
            console.debug(3);
        }
        render() {
            return <div>{console.error(4)}</div>
        }
    }
`;

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx']
});
const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);

traverse.default(ast, {
  CallExpression(path, state) {
    const calleeName = generate.default(path.node.callee).code;
    if (targetCalleeName.includes(calleeName)) {
      const { line, column } = path.node.loc.start;
      path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`))
    }
  }
});

const { code, map } = generate.default(ast);
console.log(code)