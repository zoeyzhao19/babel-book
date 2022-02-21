const locale = 'zh_CN';
const bundle = require(`./${locale}`);
const intl = {};
intl.t = function (key, ...args) {
  let index = 0;
  return bundle[key].replace(/\{placeholder\}/, () => args[index++]);
};

export default intl;
