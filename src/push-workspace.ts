/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import chalk from 'chalk';
import * as inquirer from 'inquirer';
import {commitChanges, pushChangesToGithub, startNewBranch, WorkspaceRepo} from 'polymer-workspaces';

export default async function run(reposToConvert: WorkspaceRepo[]) {
  console.log(
      chalk.dim('[1/5] ') + chalk.magenta(`Setting up push to GitHub...`));
  const {commitMessage, branchName, forcePush} = (await inquirer.prompt([
    {
      type: 'input',
      name: 'branchName',
      message: 'push to branch:',
      default: 'polymer-modulizer-auto-generated',
    },
    {
      type: 'confirm',
      name: 'forcePush',
      message: (args) => {
        return `force push? (WARNING: This will overwrite any existing "${
            args.branchName}" branch on GitHub`;
      },
      default: false,
    },
    {
      type: 'input',
      name: 'commitMessage',
      message: 'with commit message:',
      default: `"auto-generated by polymer-modulizer"`,
    }
  ]));

  console.log(chalk.dim('[2/5] ') + chalk.magenta(`Preparing new branches...`));
  await startNewBranch(reposToConvert, 'polymer-modulizer-staging');

  console.log(chalk.dim('[3/5] ') + chalk.magenta(`Committing changes...`));
  await commitChanges(reposToConvert, commitMessage);

  console.log('');
  console.log('Ready to push:');
  for (const repo of reposToConvert) {
    console.log(`  - ${repo.github.fullName}  ${
        chalk.dim(repo.github.ref || repo.github.defaultBranch)} -> ${
        chalk.cyan(branchName)}`);
  }
  console.log('');

  const {confirmPush} = (await inquirer.prompt([{
    type: 'confirm',
    name: 'confirmPush',
    message: 'start?',
    default: true,
  }]));
  if (!confirmPush) {
    return;
  }

  console.log(chalk.dim('[4/5] ') + chalk.magenta(`Pushing to GitHub...`));
  await pushChangesToGithub(reposToConvert, branchName, forcePush);

  console.log(chalk.dim('[5/5]') + ' 🎉  ' + chalk.magenta(`Push Complete!`));
}
