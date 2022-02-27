const { declare } = require('@babel/helper-plugin-utils');

function canExistAfterCompletion(path) {
  return (
    path.isFunctionDeclaration() ||
    path.isVariableDeclaration({
      kind: 'var',
    })
  );
}

module.exports = declare((api, options) => {
  api.assertVersion(7);
  return {
    pre(file) {
      file.set('uid', 0);
    },
    visitor: {
      Scopable(path, state) {
        Object.entries(path.scope.bindings).forEach(([key, binding]) => {
          if (!binding.referenced) {
            if (binding.path.get('init').isCallExpression()) {
              const comments = binding.path.get('init').node.leadingComments; //拿到节点前的注释
              if (comments && comments[0]) {
                if (comments[0].value.includes('PURE')) {
                  //有 PURE 注释就删除
                  binding.path.remove();
                  return;
                }
              }
            }
            if (path.scope.isPure(binding.path.get('init'))) {
              binding.path.remove();
            } else {
              binding.path.parentPath.replaceWith(api.types.expressionStatement(binding.path.node.init));
            }
          }
        });
      },
    },
  };
});
