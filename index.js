#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer').default;
const fs = require('fs-extra');
const path = require('path');
const downloadGitRepo = require('download-git-repo')

program
  .version('1.0.0')
  .description('Generate a new project from template');

program
  .command('create <projectName>')
  .description('创建模板')
  .action(async (projectName) => {
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
            name: 'mp-vue',
            value: 'direct:https://github.com/Dr294769070/mpvue_study.git#master'
          }
        ]
      }
    ]);

    // const templateDir = path.join(__dirname, 'template'); // 模板路径
    const targetDir = path.join(process.cwd(), projectName); // 目标路径

    // download
    downloadGitRepo(answers.template, targetDir, { clone: true },  (err) => {
      if (err) {
        console.log('模板下载失败', err)
        return
      }
      console.log('下载模板成功')

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
