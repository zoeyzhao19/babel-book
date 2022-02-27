const { declare } = require('@babel/helper-plugin-utils');

const base54 = (function () {
  var DIGITS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_';
  return function (num) {
    var ret = '';
    do {
      ret = DIGITS.charAt(num % 54) + ret;
      num = Math.floor(num / 54);
    } while (num > 0);
    return ret;
  };
})();

module.exports = declare((api, options) => {
  api.assertVersion(7);
  return {
    pre(file) {
      file.set('uid', 0);
    },
    visitor: {
      Scopable: {
        exit(path, state) {
          let uid = state.file.get('uid');
          Object.entries(path.scope.bindings).forEach(([key, binding]) => {
            if (binding.mangle) return;
            binding.mangle = true;
            const newName = path.scope.generateUid(base54(uid++));
            binding.path.scope.rename(key, newName);
          });
          state.file.set('uid', uid);
        },
      },
    },
  };
});
