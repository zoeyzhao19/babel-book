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
      BlockStatement(path, state) {
        const statementPaths = path.get('body');
        let purge = false;
        for (let i = 0; i < statementPaths.length; i++) {
          if (statementPaths[i].isCompletionStatement()) {
            purge = true;
            continue;
          }

          if (purge && !canExistAfterCompletion(statementPaths[i])) {
            statementPaths[i].remove();
          }
        }
      },
    },
  };
});
