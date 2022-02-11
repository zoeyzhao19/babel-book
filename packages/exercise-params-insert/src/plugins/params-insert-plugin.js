const targetCalleeName = ['log', 'info', 'error', 'debug'].map((item) => `console.${item}`);

module.exports = ({ types, template }) => {
  return {
    visitor: {
      CallExpression(path) {
        // 这里ast的遍历是以什么方式遍历，才会遍历到新增的节点，以至于需要做过滤判断
        if (path.node.isNew) {
          return;
        }
        const calleeName = path.get('callee').toString();
        if (targetCalleeName.includes(calleeName)) {
          const { line, column } = path.node.loc.start;
          const newNode = template.expression(`console.log("filename: (${line}, ${column})")`)();
          newNode.isNew = true;

          if (path.findParent((p) => p.isJSXElement())) {
            path.replaceWith(types.arrayExpression([newNode, path.node]));
            // 这里skip?
            path.skip();
          } else {
            path.insertBefore(newNode);
          }
        }
      },
    },
  };
};
