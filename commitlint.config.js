/**
 *  git commit最佳实践
 *  1.经常commit,One Thing，One Commit
 *  2.commit之前测试，不要commit一半工作；
 *  3.编写规范的commit message
 */

/**
 * Commit message 包括三个部分：Header，Body 和 Footer
 * <type>(<scope>): <subject>
 * 空一行
 * <body>
 * 空一行
 * <footer>
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Header包括三个字段：type（必需）、scope（可选）和subject（必需）。最多200字
    'header-max-length': [2, 'always', 200],
    // 提交类型<type>枚举
    'type-enum': [
      2,
      'always',
      [
        'init', // 项目初始化
        'clean', // 清理过时无用文件
        'merge', // 合并代码
        'style', //  修改样式文件(包括css/less/sass,图片,字体文件)
        'format', // 格式化,不影响代码含义的修改，比如空格、格式缩进、缺失的分号等
        'build', // 改变构建流程、或者增加依赖库、工具等 如webpack.config.js,package.json yarn.lock
        'chore', // 各种配置文件的修改,  如.gitignore,tsconfig.json,.vscode,.tenone, eslint/stylelint,envConfig
        'ci', // 对CI配置文件或脚本进行了修改
        'docs', // 修改项目说明文档
        'feat', // 新增功能
        'fix', // 修复bug
        'perf', // 性能优化
        'refactor', // 既不是修复bug也不是添加功能的代码重构
        'revert', // 版本回退
        'test', // 修改测试用例
      ],
    ],
    // 格式-可选值
    // 'lower-case' 小写 lowercase
    // 'upper-case' 大写 UPPERCASE
    // 'camel-case' 小驼峰 camelCase
    // 'kebab-case' 短横线 kebab-case
    // 'pascal-case' 大驼峰 PascalCase
    // 'sentence-case' 首字母大写 Sentence case
    // 'snake-case' 下划线 snake_case
    // 'start-case' 所有首字母大写 start-case
    // <type> 不能为空
    'type-empty': [2, 'never'],
    // <type> 格式 小写
    'type-case': [2, 'always', 'lower-case'],
    // <scope> 关闭改动范围不能为空规则
    'scope-empty': [0, 'never'],
    // <scope> 格式 小写
    'scope-case': [2, 'always', 'lower-case'],
    // <subject> 不能为空
    'subject-empty': [2, 'never'],
    // <subject> 关闭 以.为结束标志
    'subject-full-stop': [0, 'never', '.'],
    // <subject> 格式
    'subject-case': [2, 'never', []],
    // <body> 以空行开头
    'body-leading-blank': [1, 'always'],
    // <footer> 以空行开头
    'footer-leading-blank': [1, 'always'],
  },
};
