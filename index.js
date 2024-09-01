#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer').default;
const fs = require('fs-extra');
const path = require('path');
const downloadGitRepo = require('download-git-repo')
const ora = require('ora')
const chalk = require('chalk');
const curPackageJson = require('./package.json');
const replaceFileContent = require('./libs/replace-file-content')


// 配置版本和描述  
program
  .version(curPackageJson.version, '-v, --version', '输出版本号')
  .description('A CLI to generate projects from a template');

program
  .command('create <projectName>')
  .description('创建模板')
  .action(async (projectName) => {
    console.log(chalk.green('Welcome to Fn CLI'));
    const targetDir = path.join(process.cwd(), projectName); // 目标路径
    if (fs.existsSync(targetDir)) {
      const { isExist } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'isExist',
          message: '您输入的项目名称已存在，是否覆盖？',
        },
      ])
      isExist ? fs.removeSync(targetDir) : process.exit(1);
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: '输入项目描述',
      },
      {
        type: 'list',
        name: 'template',
        message: '请选择模版：',
        choices: [
          {
            name: 'fn-templte',
            value: 'direct:https://github.com/Dr294769070/fn-template.git#master'
            // value: 'direct:git@github.com:Dr294769070/fn-template.git#master'
          }
        ]
      }
    ]);

    const loading = ora('正在下载中...')
    loading.start()

    // download
    downloadGitRepo(answers.template, targetDir, { clone: true }, (err) => {
      if (err) {
        loading.fail('创建模版失败' + err.message)
        return
      }
      loading.succeed('创建模版成功')

      // 替换内容
      // 1.替换 package.json 中的信息
      const packageJsonPath = path.join(targetDir, 'package.json');
      const packageJson = fs.readJsonSync(packageJsonPath);
      packageJson.name = projectName;
      packageJson.description = answers.description;
      fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

      // 2.替换其他文件内容
      replaceFileContent(targetDir, {
        project: projectName
      })

      console.log(`\nProject ${projectName} created successfully!`);
      console.log(`cd ${projectName}`);
      console.log(`install deps with: ${chalk.cyan('npm i')}\n`);
    })
  });

program.parse(process.argv);