const fs = require('fs');
const path = require('path');
const dirPath = path.join(__dirname);
const locale = 'zh_CN';
const intl = {};
const bundle = {};

fs.readdirSync(dirPath).forEach((file) => {
  if (file === 'index.js') {
    return;
  } else {
    const prefix = file.replace(/\.js/, '');
    bundle[prefix] = require(`./${file}`);
  }
});

intl.t = function (key, ...args) {
  let index = 0;
  return bundle[locale][key].replace(/\$\{placeholder\}/g, () => args[index++]);
};

const res = intl.t('intl3', 'arg1', 'arg2');
console.log(res);
// export default intl;
