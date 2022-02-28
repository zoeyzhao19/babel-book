/**
 * 模块解析相关
 */

const path = require('path');
const fs = require('fs');

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (e) {
    return false;
  }
}

function resolveBabelSyntaxPlugins(modulePath) {
  const plugins = [];
  if (['.js', '.jsx'].some((ext) => modulePath.endsWith(ext))) {
    plugins.push('jsx');
  }
  if (['.ts', '.tsx'].some((ext) => modulePath.endsWith(ext))) {
    plugins.push('typescript');
  }
  return plugins;
}

function completeModulePath(modulePath) {
  const EXTS = ['.tsx', '.ts', '.jsx', '.js'];
  if (modulePath.match(/\.[a-zA-Z]+$/)) {
    return modulePath;
  }

  function tryCompletePath(resolvePath) {
    for (let i = 0; i < EXTS.length; i++) {
      let tryPath = resolvePath(EXTS[i]);
      if (fs.existsSync(tryPath)) {
        return tryPath;
      }
    }
  }

  function reportModuleNotFoundError(modulePath) {
    throw 'module not found: ' + modulePath;
  }

  if (isDirectory(modulePath)) {
    const tryModulePath = tryCompletePath((ext) => path.join(modulePath, 'index' + ext));
    if (!tryModulePath) {
      reportModuleNotFoundError(modulePath);
    } else {
      return tryModulePath;
    }
  } else if (!EXTS.some((ext) => modulePath.endsWith(ext))) {
    const tryModulePath = tryCompletePath((ext) => modulePath + ext);
    if (!tryModulePath) {
      reportModuleNotFoundError(modulePath);
    } else {
      return tryModulePath;
    }
  }
  return modulePath;
}

function moduleResolver(curModulePath, requirePath, visitedModules) {
  requirePath = path.resolve(path.dirname(curModulePath), requirePath);

  // 过滤掉第三方模块
  if (requirePath.includes('node_modules')) {
    return '';
  }

  requirePath = completeModulePath(requirePath);

  if (visitedModules.has(requirePath)) {
    return '';
  } else {
    visitedModules.add(requirePath);
  }
  return requirePath;
}

module.exports = {
  resolveBabelSyntaxPlugins,
  moduleResolver,
};
