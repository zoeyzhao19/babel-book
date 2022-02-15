const acorn = require('acorn');
const Parser = acorn.Parser;
const keywordPlugin = require('./plugins/add-keyword-plugin');

const newParser = Parser.extend(keywordPlugin);

let program = `
    guang
    const a = 1
`;

const ast = newParser.parse(program);
console.log(ast);
