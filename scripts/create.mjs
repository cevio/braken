import PKG from '../package.json' assert { type: 'json' };
import fs from 'fs-extra';
import { createPromptModule } from 'inquirer';
import { logger } from './logger.mjs';
import { resolve, dirname } from 'node:path';
import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';

const prompt = createPromptModule();
const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const template_directory = resolve(__dirname, '../templates');
const directories = readdirSync(template_directory);
const scope = '@' + PKG.name;
const { copy } = fs;

if (!directories) {
  throw new Error('缺少模板');
}

(async () => {
  const { project, template } = await createQuestions();
  const pkgDirectory = resolve(__dirname, '../packages/' + project);
  const pkgFile = resolve(pkgDirectory, 'package.json');

  await copy(template, pkgDirectory);
  
  const pkg = require(pkgFile);
  pkg.name = scope + '/' + project;
  pkg.version = PKG.version;
  writeFileSync(pkgFile, JSON.stringify(pkg, null, 2), 'utf8');

  logger.info('-', 'installing ...');
  const error = await new Promise((resolve) => {
    const ls = spawn('pnpm', ['i'], {
      cwd: process.cwd(),
      env: process.env,
    })
    ls.on('exit', code => {
      if (code === 0) return resolve(undefined);
      return resolve(new Error(`[lerna bootstrap] exit with code ${code}`));
    })
    ls.on('error', err => logger.error('', err.message))
  })

  if (error) return logger.error('-', error.message);
  logger.info('+', 'packages/' + project);
})();


async function createQuestions() {
  const { project, template } = await prompt([
    {
      type: 'input',
      message: '项目名称',
      name: 'project'
    },
    {
      type: 'list',
      name: 'template',
      message: '选择模板',
      choices: directories.map(directory => {
        return {
          name: directory,
          value: resolve(template_directory, directory)
        }
      })
    }
  ]);
  return {
    project,
    template,
  }
}