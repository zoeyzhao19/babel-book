const { declare } = require('@babel/helper-plugin-utils');
const generate = require('@babel/generator').default;
const fse = require('fs-extra');
const path = require('path');

let intlIndex = 0;
function nextIntlKey() {
  ++intlIndex;
  return `intl${intlIndex}`;
}

const autoI18nPlugin = declare((api, options) => {
  api.assertVersion(7);

  function save(file, key, value) {
    const allText = file.get('allText');
    allText.push({
      key,
      value,
    });
    file.set('allText', allText);
  }

  return {
    pre(file) {
      file.set('allText', []);
    },
    visitor: {
      Program: {
        enter(path, state) {
          let imported = false;
          const targetPath = `./src/${options.outputDir}`;
          path.traverse({
            ImportDeclaration(curPath) {
              const requirePath = curPath.node.source.value;
              if (requirePath === targetPath) {
                imported = true;
                const specifierPath = curPath.get('specifiers.0');
                if (specifierPath.isImportSpecifier() || specifierPath.isImportDefaultSpecifier()) {
                  state.intlUid = specifierPath.toString();
                } else if (specifierPath.isImportNamespaceSpecifier()) {
                  state.intlUid = specifierPath.get('local').toString();
                }
              }
            },
          });

          if (!imported) {
            const uid = path.scope.generateUid('intl');
            const importAst = api.template.ast(`import ${uid} from '${targetPath}'`);
            path.node.body.unshift(importAst);
            state.intlUid = uid;
          }

          path.traverse({
            'StringLiteral|TemplateLiteral'(path) {
              if (path.node.leadingComments) {
                path.node.leadingComments = path.node.leadingComments.filter((commentNode) => {
                  if (commentNode.value.includes('i18n-disable')) {
                    path.node.skipTransform = true;
                    delete path.node.leadingComments;
                    return false;
                  }
                  return true;
                });
              }
              // /import (*)? 'aa'/
              if (path.findParent((p) => p.isImportDeclaration())) {
                path.node.skipTransform = true;
              }
            },
          });
        },
      },

      StringLiteral(path, state) {
        if (path.node.skipTransform) {
          return;
        }
        const key = nextIntlKey();
        // 后续生成国际化文件
        save(state.file, key, path.node.value);

        let replaceExpression = api.template.ast(`${state.intlUid}.t('${key}')`).expression;
        if (path.findParent((p) => p.isJSXAttribute()) && !path.findParent((p) => p.isJSXExpressionContainer())) {
          replaceExpression = api.types.JSXExpressionContainer(replaceExpression);
        }
        path.replaceWith(replaceExpression);
        path.skip(); // 后续看看是否能把这个去掉。
      },

      TemplateLiteral(path, state) {
        if (path.node.skipTransform) {
          return;
        }
        const key = nextIntlKey();
        const value = path
          .get('quasis')
          .map((item) => item.node.value.raw)
          .join('${placeholder}');
        save(state.file, key, value);

        const expressionParams = path.node.expressions.map((item) => generate(item).code);
        let replaceExpression = api.template.ast(
          `${state.intlUid}.t('${key}', ${expressionParams.join(',')})`
        ).expression;
        if (path.findParent((p) => p.isJSXAttribute()) && !path.findParent((p) => p.isJSXExpressionContainer())) {
          replaceExpression = api.types.JSXExpressionContainer(replaceExpression);
        }
        path.replaceWith(replaceExpression);
        path.skip();
      },
    },
    post(file) {
      const allText = file.get('allText');

      const intlData = allText.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
      }, {});
      const content = `const resource = ${JSON.stringify(intlData, null, 4)};\nexport default resource;`;

      const dir = path.join(__dirname, `../${options.outputDir}`);
      fse.ensureDirSync(dir);
      fse.writeFileSync(path.join(dir, 'zh_CN.js'), content);
      fse.writeFileSync(path.join(dir, 'en_US.js'), content);
    },
  };
});

module.exports = autoI18nPlugin;
