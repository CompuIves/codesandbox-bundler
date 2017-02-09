import * as path from 'path';
import * as fs from 'fs';

import getAuthorUsername from './utils/author-name';
import { createDirectoryRecursively, deleteDirectory } from '../utils/directories';

const TEMP_ROOT = 'temp/registry';

const promiseMkdir = (dir) => new Promise((resolve, reject) => {
  fs.mkdir(dir, (err) => {
    if (err) reject(err);
    resolve();
  })
});

const promiseMkFile = (dir, module) => new Promise((resolve, reject) => {
  fs.writeFile(path.join(dir, module.title), module.code, (err) => {
    if (err) reject(err);
    resolve();
  });
});

/**
 * Creates the directory with all chilren, calls itself for directories in it
 */
async function generateDirectory(directoryPath, source, directory) {
  const directoryChildren = source.directories.filter(d => d.directory_id == directory.id);
  const moduleChildren = source.modules.filter(m => m.directory_id == directory.id);

  // Create own directory
  const rootDirectoryPath = path.join(directoryPath, directory.title);
  await promiseMkdir(rootDirectoryPath);

  // Create all children directories
  await Promise.all(directoryChildren.map(dir => generateDirectory(rootDirectoryPath, source, dir)));

  // Create all modules
  await Promise.all(moduleChildren.map(module => promiseMkFile(rootDirectoryPath, module)));
}

/**
 * Generates the files that need to be tarred from a source
 *
 * Can specify a custom file system to use, it should follow the node system
 */
export default async function (version) {
  const source = version.source;
  const sandbox = version.sandbox;
  const directory = path.join(TEMP_ROOT, getAuthorUsername(sandbox.author), sandbox.slug, version.version);

  await deleteDirectory(directory);
  await createDirectoryRecursively(directory);

  const rootDirectories = source.directories.filter(d => d.directory_id == null);

  await Promise.all(rootDirectories.map(dir => generateDirectory(directory, source, dir)));
}
