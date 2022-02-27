const { transformFromAstSync } = require('@babel/core');
const parser = require('@babel/parser');
const assignStatementTypeCheckPlugin = require('./plugins/type-check1');
const funcArgumentTypeCheckPlugin = require('./plugins/type-check2');
const genericsTypeCheckPlugin = require('./plugins/type-check3');
const extendTypeCheckPlugin = require('./plugins/type-check4');

const sourceCode1 = `let name: string;name = 111;`;
const sourceCode2 = `function add(a: number, b: number): number{
  return a + b;
}
add(1, '2');`;
const sourceCode3 = `function add<T>(a: T, b: T) {
  return a + b;
}
add<number>(1, '2');`;
const sourceCode4 = `type Res<Param> = Param extends 1 ? number : string;
function add<T>(a: T, b: T) {
    return a + b;
}
add<Res<1>>(1, '2');`;

const ast = parser.parse(sourceCode4, {
  sourceType: 'unambiguous',
  plugins: ['typescript'],
});

const { code } = transformFromAstSync(ast, sourceCode4, {
  plugins: [extendTypeCheckPlugin],
});
