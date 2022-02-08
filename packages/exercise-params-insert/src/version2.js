const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');

/**
 * 在console中插入行列号
 */
const sourceCode = `
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
`;

const ast = parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx'],
});
const targetCalleeName = ['log', 'info', 'error', 'debug'].map((item) => `console.${item}`);

traverse(ast, {
  CallExpression(path) {
    const calleeName = generate(path.node.callee).code;
    if (targetCalleeName.includes(calleeName)) {
      const { line, column } = path.node.loc.start;
      path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`));
    }
  },
});

const { code } = generate(ast);
console.log(code);
