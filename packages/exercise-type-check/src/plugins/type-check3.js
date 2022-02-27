/**
 * 带泛型的类型检查
 */
const { declare } = require('@babel/helper-plugin-utils');

function resolveType(targetType, referenceTypesMap = {}) {
  const tsTypeAnnotationMap = {
    TSStringKeyword: 'string',
    TSNumberKeyword: 'number',
  };
  switch (targetType.type) {
    case 'TSTypeAnnotation':
      if (targetType.typeAnnotation.type === 'TSTypeReference') {
        return referenceTypesMap[targetType.typeAnnotation.typeName.name];
      }
      return tsTypeAnnotationMap[targetType.typeAnnotation.type];
    case 'NumberTypeAnnotation':
      return 'number';
    case 'StringTypeAnnotation':
      return 'string';
    case 'TSNumberKeyword':
      return 'number';
  }
}

function noStackTraceWrapper(cb) {
  const tmp = Error.stackTraceLimit;
  Error.stackTraceLimit = 0;
  cb && cb(Error);
  Error.stackTraceLimit = tmp;
}

module.exports = declare((api, options) => {
  api.assertVersion(7);
  return {
    pre(file) {
      file.set('errors', []);
    },
    visitor: {
      CallExpression(path, state) {
        const errors = state.file.get('errors');
        const calleeName = path.get('callee').toString();
        // 传入的泛型类型
        const realTypes = path.get('typeParameters').node.params.map((item) => {
          return resolveType(item);
        });
        // 传入的参数类型
        const argumentsTypes = path.get('arguments').map((item) => {
          return resolveType(item.getTypeAnnotation());
        });
        const functionDeclarePath = path.scope.getBinding(calleeName).path;
        const realTypeMap = {};
        functionDeclarePath.node.typeParameters.params.map((item, index) => {
          realTypeMap[item.name] = realTypes[index];
        });
        const declareParamsTypes = functionDeclarePath.get('params').map((item) => {
          return resolveType(item.getTypeAnnotation(), realTypeMap);
        });
        argumentsTypes.forEach((item, index) => {
          if (item !== declareParamsTypes[index]) {
            // 类型不一致，报错
            noStackTraceWrapper((Error) => {
              errors.push(
                path
                  .get('arguments.' + index)
                  .buildCodeFrameError(`${item} can not assign to ${declareParamsTypes[index]}`, Error)
              );
            });
          }
        });
      },
    },
    post(file) {
      console.log(file.get('errors'));
    },
  };
});
