// #!/usr/bin/env node
const commander = require('commander');
const glob = require('glob');
const { cosmiconfigSync } = require('cosmiconfig');
const fsPromises = require('fs').promises;
const path = require('path');
const myBabel = require('../core/index.js');

console.log('process.cwd', process.cwd());
commander.option('--out-dir <ourDir>', '输出目录');
commander.option('--watch', '监听文件变动');

if (process.argv.length <= 2) {
  commander.outputHelp();
  process.exit(0);
}

commander.parse(process.argv);
const cliOpts = commander.opts();
console.log(commander.args);
if (!commander.args[0]) {
  console.error('没有指定待编译文件');
  commander.outputHelp();
  process.exit(1);
}
if (!cliOpts.outDir) {
  console.error('没有指定输出目录');
  commander.outputHelp();
  process.exit(1);
}

if (cliOpts.watch) {
  const chokidar = require('chokidar');
  console.log('commander.args[0]', commander.args[0]);
  chokidar.watch(commander.args[0]).on('change', (event, path) => {
    console.log('检测到文件变动，编译：' + path);
    compile([path]);
  });
}

const filenames = glob.sync(commander.args[0]);
const explorerSync = cosmiconfigSync('myBabel');
const searchResult = explorerSync.search();

const options = {
  babelOptions: searchResult.config,
  cliOptions: {
    ...cliOpts,
    filenames,
  },
};

function compile(fileNames) {
  fileNames.forEach(async (filename) => {
    const fileContent = await fsPromises.readFile(filename, 'utf-8');
    const baseFileName = path.basename(filename);
    const sourceMapFileName = baseFileName + '.map.json';

    //
    const res = myBabel.transformSync(fileContent, {
      ...options.babelOptions,
      fileName: baseFileName,
    });
    const generatedFile = res.code + '\n' + '//# sourceMappingURL=' + sourceMapFileName;

    //如果目录不存在则创建
    try {
      await fsPromises.access(options.cliOptions.outDir);
    } catch (e) {
      await fsPromises.mkdir(options.cliOptions.outDir);
    }

    const distFilePath = path.join(options.cliOptions.outDir, baseFileName);
    const distSourceMapPath = path.join(options.cliOptions.outDir, sourceMapFileName);

    await fsPromises.writeFile(distFilePath, generatedFile);
    await fsPromises.writeFile(distSourceMapPath, res.map);
  });
}

compile(options.cliOptions.filenames);
