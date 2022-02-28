const parser = require('@babel/parser');
const { codeFrameColumns } = require('@babel/code-frame');
const chalk = require('chalk');
const Scope = require('./scope');

const globalScope = new Scope();
globalScope.set('console', {
  log: function (...args) {
    console.log(chalk.green(...args));
  },
  error: function (...args) {
    console.error(chalk.red(...args));
  },
  warning: function (...args) {
    console.warning(chalk.orange(...args));
  },
});

const sourceCode = `
function add(a, b) {
  let c = 3;
  return a + b + c;
}
console.log(add(1,2))
`;

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
});

const evaluator = (function () {
  const astInterpreter = {
    Program(node, scope) {
      node.body.forEach((item) => {
        evaluate(item, scope);
      });
    },
    VariableDeclaration(node, scope) {
      node.declarations.forEach((item) => {
        evaluate(item, scope);
      });
    },
    VariableDeclarator(node, scope) {
      const declareName = evaluate(node.id);
      if (scope.get(declareName)) {
        throw Error('duplicate declare variable：' + declareName);
      } else {
        scope.set(declareName, evaluate(node.init, scope));
      }
    },
    Identifier(node, scope) {
      return node.name;
    },
    BinaryExpression(node, scope) {
      let leftValue = evaluate(node.left, scope);
      let rightValue = evaluate(node.right, scope);
      if (scope.get(leftValue)) {
        leftValue = scope.get(leftValue);
      }
      if (scope.get(rightValue)) {
        rightValue = scope.get(rightValue);
      }
      switch (node.operator) {
        case '+':
          return leftValue + rightValue;
        case '-':
          return leftValue - rightValue;
        case '*':
          return leftValue * rightValue;
        case '/':
          return leftValue / rightValue;
        default:
          throw Error('upsupported operator：' + node.operator);
      }
    },
    NumericLiteral(node, type) {
      return node.value;
    },
    ExpressionStatement(node, scope) {
      evaluate(node.expression, scope);
    },
    CallExpression(node, scope) {
      const fn = evaluate(node.callee, scope);
      const args = node.arguments.map((item) => {
        if (item.type === 'Identifier') {
          return scope.get(item.name);
        }
        return evaluate(item, scope);
      });
      if (node.callee.type === 'MemberExpression') {
        const obj = evaluate(node.callee.object, scope);
        return fn.apply(obj, args);
      } else {
        const fn = scope.get(evaluate(node.callee, scope));
        return fn.apply(null, args);
      }
    },
    MemberExpression(node, scope) {
      const name = evaluate(node.object, scope);
      const obj = scope.get(name);
      return obj[evaluate(node.property)];
    },
    FunctionDeclaration(node, scope) {
      const fnName = evaluate(node.id, scope);
      if (scope.get(fnName)) {
        throw Error('duplicate declare variable：' + fnName);
      } else {
        scope.set(fnName, function (...args) {
          const funcScope = new Scope();
          funcScope.parent = scope;

          node.params.forEach((item, index) => {
            funcScope.set(evaluate(item, funcScope), args[index]);
          });
          funcScope.set('this', this);
          return evaluate(node.body, funcScope);
        });
      }
    },
    BlockStatement(node, scope) {
      for (let i = 0; i < node.body.length; i++) {
        if (node.body[i].type === 'ReturnStatement') {
          return evaluate(node.body[i], scope);
        } else {
          evaluate(node.body[i], scope);
        }
      }
    },
    ReturnStatement(node, scope) {
      return evaluate(node.argument, scope);
    },
  };

  const evaluate = (node, scope) => {
    try {
      return astInterpreter[node.type](node, scope);
    } catch (e) {
      if (e && e.message && e.message.indexOf('astInterpreters[node.type] is not a function') != -1) {
        console.error('unsupported ast type: ' + node.type);
        console.error(
          codeFrameColumns(sourceCode, node.loc, {
            highlightCode: true,
          })
        );
      } else {
        console.error(node.type + ':', e.message);
        console.error(
          codeFrameColumns(sourceCode, node.loc, {
            highlightCode: true,
          })
        );
      }
    }
  };

  return {
    evaluate,
  };
})();

evaluator.evaluate(ast.program, globalScope);
