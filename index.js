#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer').default;
const fs = require('fs-extra');
const path = require('path');
const downloadGitRepo = require('download-git-repo')
const ora = require('ora')


program
  .version('1.0.0')
  .description('Generate a new project from template');

program
  .command('create <projectName>')
  .description('创建模板')
  .action(async (projectName) => {
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
          }
        ]
      }
    ]);

    // const templateDir = path.join(__dirname, 'template'); // 模板路径
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
      const packageJsonPath = path.join(targetDir, 'package.json');
      const packageJson = fs.readJsonSync(packageJsonPath);

      packageJson.name = projectName;
      packageJson.description = answers.description;

      fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
      console.log(`\nProject ${projectName} created successfully!`);
      console.log(`\nNext steps:\n`);
      console.log(`cd ${projectName}`);
      console.log(`${answers.packageManager} install`);
    })
  });

program.parse(process.argv);
