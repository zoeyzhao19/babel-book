const { visitorKeys } = require('../types');
const NodePath = require('./path/NodePath');

function traverse(node, visitor, parent, parentPath, key, listKey) {
  const defination = visitorKeys.get(node.type);

  let visitorFuncs = visitor[node.type] || {};

  if (typeof visitorFuncs === 'function') {
    visitorFuncs = {
      enter: visitorFuncs,
    };
  }

  const path = new NodePath(node, parent, parentPath, key, listKey);

  visitorFuncs.enter && visitorFuncs.enter(path);

  if (node.__shouldSkip) {
    delete node.__shouldSkip;
    return;
  }

  if (defination.visitor) {
    defination.visitor.forEach((key) => {
      const prop = node[key];

      if (Array.isArray(prop)) {
        prop.forEach((childNode, index) => {
          traverse(childNode, visitor, node, path, index, key);
        });
      } else {
        traverse(prop, visitor, node, path, key);
      }
    });
  }

  visitorFuncs.exit && visitorFuncs.exit();
}

module.exports = traverse;
