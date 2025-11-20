#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rm = promisify(fs.rm);

// Configuration
const TARGET_DIR_NAME = '.next';
const IGNORE_DIRS = ['node_modules', '.git', '.vscode', 'dist', 'build'];

// Helper: Format bytes to human readable string
const formatSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

// Helper: Calculate directory size recursively
const getDirSize = async (dirPath) => {
  let size = 0;
  try {
    const files = await readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await stat(filePath);
      if (stats.isDirectory()) {
        size += await getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (error) {
    // Ignore permission errors or missing files during scan
    return 0;
  }
  return size;
};

// Helper: Recursive search
const findNextFolders = async (dir, found = []) => {
  try {
    const files = await readdir(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      
      // Get stats to check if it's a directory
      let stats;
      try {
        stats = await stat(fullPath);
      } catch (e) {
        continue; // Skip broken links/permission issues
      }

      if (stats.isDirectory()) {
        // If we found the target
        if (file === TARGET_DIR_NAME) {
          const size = await getDirSize(fullPath);
          found.push({ path: fullPath, size });
          // Don't recurse into the .next folder itself
          continue;
        }

        // Recurse if not in ignore list
        if (!IGNORE_DIRS.includes(file)) {
          await findNextFolders(fullPath, found);
        }
      }
    }
  } catch (error) {
    // Fail silently on directories we can't read
  }
  return found;
};

const main = async () => {
  console.log(chalk.cyan.bold('\n🧹 Next.js Cleaner (Like npkill for .next)\n'));
  
  const spinner = ora('Scanning current directory recursively...').start();
  const currentDir = process.cwd();

  try {
    const results = await findNextFolders(currentDir);
    spinner.stop();

    if (results.length === 0) {
      console.log(chalk.yellow('No .next directories found.'));
      process.exit(0);
    }

    // sort by path length to keep sub-projects grouped nicely, or by size
    // Let's sort alphabetical by path
    results.sort((a, b) => a.path.localeCompare(b.path));

    const totalPossibleSpace = results.reduce((acc, curr) => acc + curr.size, 0);
    console.log(chalk.gray(`Found ${results.length} folders. Potential space to reclaim: ${chalk.green(formatSize(totalPossibleSpace))}\n`));

    // Create the choices for inquirer
    const choices = results.map(item => {
      // Make the path look relative and pretty
      const relativePath = path.relative(currentDir, item.path);
      return {
        name: `${chalk.bold(relativePath)}  ${chalk.gray(formatSize(item.size))}`,
        value: item.path,
        checked: false // Default to unchecked for safety
      };
    });

    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'foldersToDelete',
        message: 'Select folders to delete (Space to select, Enter to confirm):',
        choices: choices,
        pageSize: 15,
        loop: false,
      }
    ]);

    if (answer.foldersToDelete.length === 0) {
      console.log(chalk.yellow('No files selected. Exiting.'));
      process.exit(0);
    }

    // Confirmation logic (Optional, but good for safety. npkill doesn't ask twice, but we will just go ahead)
    const deleteSpinner = ora('Deleting selected folders...').start();
    
    let freedSpace = 0;
    
    for (const dirPath of answer.foldersToDelete) {
        // Calculate size again just for the final report, or use the cached value
        const item = results.find(r => r.path === dirPath);
        if(item) freedSpace += item.size;

        await rm(dirPath, { recursive: true, force: true });
    }

    deleteSpinner.succeed(chalk.green('Cleanup complete!'));
    console.log(chalk.bold(`\n🎉 Reclaimed space: ${chalk.cyan(formatSize(freedSpace))}\n`));

  } catch (error) {
    spinner.fail('An error occurred');
    console.error(error);
  }
};

main();