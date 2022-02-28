const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { resolveBabelSyntaxPlugins, moduleResolver } = require('./util');
const DependencyNode = require('./dependencyNode');

const IMPORT_TYPE = {
  deconstruct: 'deconstruct',
  default: 'default',
  namespace: 'namespace',
};
const EXPORT_TYPE = {
  all: 'all',
  default: 'default',
  named: 'named',
};

const visitedModules = new Set();

function traverseModule(curModulePath, dependencyGraphNode, allModules) {
  const moduleFileContent = fs.readFileSync(curModulePath, {
    encoding: 'utf-8',
  });
  dependencyGraphNode.path = curModulePath;

  const ast = parser.parse(moduleFileContent, {
    sourceType: 'unambiguous',
    plugins: resolveBabelSyntaxPlugins(curModulePath),
  });

  traverse(ast, {
    ImportDeclaration(path, state) {
      const subModulePath = moduleResolver(curModulePath, path.get('source.value').node, visitedModules);
      if (!subModulePath) {
        // 没有解析到对应路径的模块
        return;
      }
      const specifierPaths = path.get('specifiers');
      dependencyGraphNode.imports[subModulePath] = specifierPaths.map((specifierPath) => {
        if (specifierPath.isImportSpecifier()) {
          return {
            type: IMPORT_TYPE.deconstruct,
            imported: specifierPath.get('imported').node.name,
            local: specifierPath.get('local').node.name,
          };
        } else if (specifierPath.isImportDefaultSpecifier()) {
          return {
            type: IMPORT_TYPE.default,
            local: specifierPath.get('local').node.name,
          };
        } else {
          return {
            type: IMPORT_TYPE.namespace,
            local: specifierPath.get('local').node.name,
          };
        }
      });

      const subModule = new DependencyNode();
      traverseModule(subModulePath, subModule, allModules);
      dependencyGraphNode.subModules[subModule.path] = subModule;
    },
    ExportDeclaration(path, state) {
      if (path.isExportDefaultDeclaration()) {
        let exportName;
        if (path.get('declaration').isIdentifier()) {
          exportName = path.get('declaration').node.name;
        } else {
          exportName = path.get('declaration').node.left.name;
        }
        dependencyGraphNode.exports.push({
          type: EXPORT_TYPE.default,
          exported: exportName,
        });
      } else if (path.isExportNamedDeclaration()) {
        path.get('specifiers').forEach((specifier) => {
          dependencyGraphNode.exports.push({
            type: EXPORT_TYPE.named,
            local: specifier.get('local').toString(),
            exported: specifier.get('exported').toString(),
          });
        });
      } else {
        dependencyGraphNode.exports.push({
          type: EXPORT_TYPE.all,
          exported: path.get('exported').node.name,
          source: path.get('source').node.value,
        });
      }
    },
  });

  allModules[curModulePath] = dependencyGraphNode;
}

module.exports = function (curModulePath) {
  const dependencyGraph = {
    root: new DependencyNode(),
    allModules: {},
  };
  traverseModule(curModulePath, dependencyGraph.root, dependencyGraph.allModules);
  return dependencyGraph;
};
