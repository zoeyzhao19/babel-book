class Binding {
  constructor(id, path, scope, kind) {
    this.id = id;
    this.path = path;
    this.referenced = false;
    this.referencePaths = [];
  }
}

class Scope {
  constructor(parentScope, path) {
    this.parent = parentScope;
    this.bindings = {};
    this.path = path;

    // scope创建完之后我们要扫描作用域中所有的声明，记录到scope，这里要注意的是，遇到函数作用域就要跳过遍历，因为它有自己的独立的作用域
    path.traverse({
      VariableDeclarator: (childPath) => {
        this.registerBinding(childPath.node.id.name, childPath);
      },
      FunctionDeclaration: (childPath) => {
        childPath.skip();
        this.registerBinding(childPath.node.id.name, childPath);
      },
    });

    // 记录完binding后，再扫描所有引用该binding的地方
    path.traverse({
      Identifier: (childPath) => {
        if (!childPath.findParent((p) => p.isVariableDeclarator() || p.isFunctionDeclaration())) {
          const id = childPath.node.name;
          const binding = this.getBinding(id);
          if (binding) {
            binding.referenced = true;
            binding.referencePaths.push(childPath);
          }
        }
      },
    });
  }

  registerBinding(id, path) {
    this.bindings[id] = new Binding(id, path);
  }

  getOwnBinding(id) {
    return this.bindings[id];
  }

  getBinding(id) {
    let res = this.getOwnBinding(id);
    if (!res && this.parent) {
      res = this.parent.getOwnBinding(id);
    }
    return res;
  }

  hasBinding(id) {
    return !!this.bindings[id];
  }
}

module.exports = Scope;
