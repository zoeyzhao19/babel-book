module.exports = {
  plugins: [
    [
      '@babel/transform-runtime',
      {
        corejs: 3,
      },
    ],
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '44',
        },
        useBuiltIns: false, // or "entry" or "false"
        corejs: 3,
      },
    ],
  ],
  plugins: [
    '@babel/transform-runtime',
    // [
    //   '@babel/transform-runtime',
    //   {
    //     corejs: 3,
    //   },
    // ],
  ],
};
/**
 * useBuiltIns 是配置polyfill导入方式
 */
/**
 * @babel/transform-runtime是对运行代码中使用的helper和polyfill等新特性做处理，因为没有target配置，所以可能会做一些多余的转换和 polyfill
 */
/**
 * @babel/transform-runtime如果不配置coreJs选项，则只会做helper的模块化引入，并且不污染全局环境
 * 这时候@babel/preset-env的useBuiltIns配置项涉及到api的polyfill部分则根据entry/usage/false设置
 */

/**
 * @babel/transform-runtime如果配置了coreJs选项，则除了做helper的模块化引入，不污染全局环境之外，还会做polyfill的api转换
 * 这时候@babel/preset-env的useBuiltIns配置项涉及到api的polyfill不起作用。entry的手动引入core-js更是多余的。
 */
