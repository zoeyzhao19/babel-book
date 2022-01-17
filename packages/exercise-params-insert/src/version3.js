import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import template from '@babel/template';
import types from '@babel/types';

/**
 * 在console日志前一行插入行列号
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
  plugins: ['jsx'],
});
const targetCalleeName = ['log', 'info', 'error', 'debug'].map((item) => `console.${item}`);

traverse.default(ast, {
  CallExpression(path) {
    if (path.node.isNew) {
      return;
    }
    const calleeName = generate.default(path.node.callee).code;
    if (targetCalleeName.includes(calleeName)) {
      const { line, column } = path.node.loc.start;
      const newNode = template.default.expression(`console.log("filename: (${line}, ${column})")`)();
      newNode.isNew = true;

      if (path.findParent((p) => p.isJSXElement())) {
        path.replaceWith(types.arrayExpression([newNode, path.node]));
        path.skip();
      } else {
        path.insertBefore(newNode);
      }
    }
  },
});

const { code } = generate.default(ast);
console.log(code);
