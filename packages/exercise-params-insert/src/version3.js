const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');
const template = require('@babel/template').default;

/**
 * 在console日志前一行插入行列号
 */
const sourceCode = `
    console.log(1);

    for(let i = 0; i < 10; i++ ){}

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

const ast = parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx'],
});
const targetCalleeName = ['log', 'info', 'error', 'debug'].map((item) => `console.${item}`);

traverse(ast, {
  CallExpression(path) {
    if (path.node.isNew) {
      return;
    }
    const calleeName = generate(path.node.callee).code;
    if (targetCalleeName.includes(calleeName)) {
      const { line, column } = path.node.loc.start;
      const newNode = template.expression(`console.log("filename: (${line}, ${column})")`)();
      newNode.isNew = true;

      if (path.findParent((p) => p.isJSXElement())) {
        path.replaceWith(types.arrayExpression([newNode, path.node]));
        path.skip();
      } else {
        path.insertBefore(newNode);
      }
    }
  },
  // 优先级高，会覆盖包含的visitor的单独定义
  'CallExpression|ClassMethod'() {
    console.log('测试联合');
  },
  ClassMethod() {
    console.log('this is class Method');
  },
  Statement() {
    console.log('test virualtype');
  },
});

const { code } = generate(ast);
console.log(code);
