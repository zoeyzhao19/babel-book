const { declare } = require('@babel/helper-plugin-utils');
const path = require('path');
const fse = require('fs-extra');

module.exports = declare((api) => {
  api.assertVersion(7);
  return {
    pre(file) {
      file.set('errors', []);
    },
    visitor: {
      ForStatement(path, state) {
        const errors = state.file.get('errors');
        const testNode = path.get('test').node;
        const updateNode = path.get('update').node;
        let shouldUpdateOperator;
        if (['<', '<='].includes(testNode.operator)) {
          shouldUpdateOperator = '++';
        } else if (['>', '>='].includes(testNode.operator)) {
          shouldUpdateOperator = '--';
        }

        if (shouldUpdateOperator !== updateNode.operator) {
          // 报错：遍历方向错误
          const tmp = Error.stackTraceLimit;
          Error.stackTraceLimit = 0;
          console.log('errors push');
          errors.push(path.get('update').buildCodeFrameError('for direction error', Error));
          Error.stackTraceLimit = tmp;
        }
      },
    },
    post(file) {
      const errors = file.get('errors');
      console.log(errors);
      const content = `${errors}`;

      fse.writeFileSync(path.join(__dirname, './error.txt'), content);
    },
  };
});
