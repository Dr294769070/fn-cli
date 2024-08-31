#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer').default;
const fs = require('fs-extra');
const path = require('path');

program
  .version('1.0.0')
  .description('Generate a new project from template');

program
  .command('create <projectName>')
  .description('Create a new project')
  .action(async (projectName) => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Enter project description:',
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Choose package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
      },
    ]);

    const templateDir = path.join(__dirname, 'template'); // 模板路径
    const targetDir = path.join(process.cwd(), projectName); // 目标路径

    // 拷贝模板
    fs.copySync(templateDir, targetDir);

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
  });

program.parse(process.argv);
