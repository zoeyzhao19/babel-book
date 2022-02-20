const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');

const autoTrackPlugin = declare((api, options) => {
  api.assertVersion(7);
  return {
    visitor: {
      Program: {
        enter(path, state) {
          path.traverse({
            ImportDeclaration(curPath) {
              const requirePath = curPath.get('source').node.value;
              if (requirePath === options.trackerPath) {
                // 如果已经引入了
                const specifierPath = curPath.get('specifiers.0');
                if (specifierPath.isImportSpecifier() || specifierPath.isImportDefaultSpecifier()) {
                  state.trackerImportId = specifierPath.toString();
                  console.log('state.trackerImportId', state.trackerImportId);
                } else if (specifierPath.isImportNamespaceSpecifier()) {
                  state.trackerImportId = specifierPath.get('local').toString();
                }
                curPath.stop();
              }
            },
          });

          if (!state.trackerImportId) {
            state.trackerImportId = importModule.addDefault(path, 'tracker', {
              nameHint: path.scope.generateUid('tracker'),
            }).name;
          }
        },
      },

      'FunctionDeclaration|ClassMethod|ArrowFunctionExpression|FunctionExpression'(path, state) {
        const bodyPath = path.get('body');
        if (bodyPath.isBlockStatement()) {
          const ast = api.template.statement(`${state.trackerImportId}()`)();
          bodyPath.node.body.unshift(ast);
        } else {
          const ast = api.template.statement(`{${state.trackerImportId}();return PREV_BODY;}`)({
            PREV_BODY: bodyPath.node,
          });
          bodyPath.replaceWith(ast);
        }
      },
    },
  };
});

module.exports = autoTrackPlugin;
