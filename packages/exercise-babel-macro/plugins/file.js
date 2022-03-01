const { declare } = require('@babel/helper-plugin-utils');
const fs = require('fs');
const path = require('path');

/**
 * 如果我们写插件，那么就是通过 visitor 找到 files 的函数调用，
 * 然后执行 fs.readdirSync 查询出文件列表，之后替换该处的 ast 为 StringLiteral 的数组。
 */
module.exports = declare((api, options) => {
  api.assertVersion(7);

  return {
    visitor: {
      CallExpression(curPath, state) {
        const name = curPath.get('callee').toString();
        let filesNode = [];
        if (name === 'files') {
          curPath.get('arguments').map((item) => {
            const dirname = path.dirname(state.filename);
            const files = fs.readdirSync(path.resolve(dirname, item.node.value), {
              encoding: 'utf-8',
            });
            filesNode = files.map((file) => {
              return api.types.stringLiteral(file);
            });
          });
          const arrayExpression = api.types.arrayExpression(filesNode);
          curPath.parentPath.replaceWith(arrayExpression);
        }
      },
    },
  };
});
