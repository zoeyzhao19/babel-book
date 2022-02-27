/**
 * 赋值语句的类型检查
 */

const { declare } = require('@babel/helper-plugin-utils');

function resolveType(targetType) {
  const tsTypeAnnotationMap = {
    TSStringKeyword: 'string',
  };
  switch (targetType.type) {
    case 'TSTypeAnnotation':
      return tsTypeAnnotationMap[targetType.typeAnnotation.type];
    case 'NumberTypeAnnotation':
      return 'number';
  }
}

module.exports = declare((api, options) => {
  api.assertVersion(7);
  return {
    pre(file) {
      file.set('errors', []);
    },
    visitor: {
      AssignmentExpression(path, state) {
        const rightType = resolveType(path.get('right').getTypeAnnotation());
        const leftBinding = path.scope.getBinding(path.get('left'));
        const leftType = resolveType(leftBinding.path.get('id').getTypeAnnotation());
        if (leftType !== rightType) {
          const tmp = Error.stackTraceLimit;
          Error.stackTraceLimit = 0;
          console.log(path.get('right').buildCodeFrameError(`${rightType} can not assign to ${leftType}`, Error));
          Error.stackTraceLimit = tmp;
        }
      },
    },
    post(file) {
      console.log(file.get('errors'));
    },
  };
});
