const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);

export default ({types, template}, options, dirname) => {
  return {
    visitor: {
      CallExpression(path, state) {
        if (path.node.isNew) {
          return;
        }
        const calleeName = path.get('callee').toString();
        console.log('path.get(callee)', path.get('callee'))
        console.log('calleeName', calleeName)
        if (targetCalleeName.includes(calleeName)) {
          const { line, column } = path.node.loc.start;
          const newNode = template.expression(`console.log("filename: (${line}, ${column})")`)();
          newNode.isNew = true;
    
          if(path.findParent(p => p.isJSXElement())) {
            path.replaceWith(types.arrayExpression([newNode, path.node]));
            path.skip();
          } else {
            path.insertBefore(newNode);
          }
        }
      }
    }
  }
};