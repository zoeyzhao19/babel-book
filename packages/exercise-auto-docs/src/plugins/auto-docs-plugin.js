const { declare } = require('@babel/helper-plugin-utils');
const doctrine = require('doctrine');
const fse = require('fs-extra');
const path = require('path');
const renderer = require('./renderer');

function parseComment(commentStr) {
  if (!commentStr) {
    return;
  }
  return doctrine.parse(commentStr, {
    unwrap: true,
  });
}

function resolveType(tsType) {
  const typeAnnotation = tsType.typeAnnotation;
  if (!typeAnnotation) {
    return;
  }
  switch (typeAnnotation.type) {
    case 'TSStringKeyword':
      return 'string';
    case 'TSNumberKeyword':
      return 'number';
    case 'TSBooleanKeyword':
      return 'boolean';
  }
}

function generate(docs, format = 'json') {
  if (format === 'markdown') {
    return {
      ext: '.md',
      content: renderer.markdown(docs),
    };
  } else if (format === 'html') {
    return {
      ext: 'html',
      content: renderer.html(docs),
    };
  } else {
    return {
      ext: 'json',
      content: renderer.json(docs),
    };
  }
}

module.exports = declare((api, options) => {
  api.assertVersion(7);

  return {
    pre(file) {
      file.set('docs', []);
    },
    visitor: {
      FunctionDeclaration(path, state) {
        const docs = state.file.get('docs');
        docs.push({
          type: 'function',
          name: path.get('id').toString(), // path.node.id.name;
          params: path.get('params').map((paramPath) => {
            return {
              name: paramPath.toString(),
              type: resolveType(paramPath.getTypeAnnotation()),
            };
          }),
          return: resolveType(path.get('returnType').getTypeAnnotation()),
          doc: path.node.leadingComments && parseComment(path.node.leadingComments.slice(-1)[0].value),
        });
        state.file.set('docs', docs);
      },
      ClassDeclaration(path, state) {
        const docs = state.file.get('docs');
        const classInfo = {
          type: 'class',
          name: path.get('id').toString(),
          constructorInfo: {},
          methodsInfo: [],
          propertiesInfo: [],
        };
        if (path.node.leadingComments) {
          classInfo.doc = parseComment(path.node.leadingComments.slice(-1)[0].value);
        }
        // 也可以直接遍历path.get('body').node.body
        path.traverse({
          ClassProperty(curPath) {
            classInfo.propertiesInfo.push({
              name: curPath.get('key').toString(),
              type: resolveType(curPath.getTypeAnnotation()),
              doc: [curPath.node.leadingComments, curPath.node.trailingComments]
                .filter(Boolean)
                .flatMap((x) => x)
                .map((comment) => {
                  return parseComment(comment.value);
                })
                .filter(Boolean),
            });
          },
          ClassMethod(curPath) {
            if (path.node.kind === 'constructor') {
              classInfo.constructorInfo = {
                params: path.get('params').map((paramPath) => {
                  return {
                    name: paramPath.toString(),
                    type: resolveType(paramPath.getTypeAnnotation()),
                    doc: curPath.node.leadingComments && parseComment(curPath.node.leadingComments.slice(-1)[0].value),
                  };
                }),
              };
            } else {
              classInfo.methodsInfo.push({
                name: curPath.get('key').toString(),
                params: curPath.get('params').map((paramPath) => {
                  return {
                    name: paramPath.toString(),
                    type: resolveType(paramPath.getTypeAnnotation()),
                  };
                }),
                return: resolveType(curPath.get('returnType').getTypeAnnotation()),
                doc: curPath.node.leadingComments && parseComment(curPath.node.leadingComments.slice(-1)[0].value),
              });
            }
          },
        });
        docs.push(classInfo);
        state.file.set('docs', docs);
      },
    },
    post(file) {
      const docs = file.get('docs');
      const res = generate(docs, options.format);
      fse.ensureDirSync(options.outputDir);
      fse.writeFileSync(path.join(options.outputDir, 'docs' + res.ext), res.content);
    },
  };
});
