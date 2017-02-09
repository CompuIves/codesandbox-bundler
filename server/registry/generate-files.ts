import * as path from 'path';
import { tmpdir } from 'os';

import getAuthorUsername from './utils/author-name';
import { createDirectoryRecursively, deleteDirectory } from '../utils/directories';
import { writeFile, mkdir } from 'mz/fs';

export const TEMP_ROOT = `${tmpdir()}/registry`;

/**
 * Creates the directory with all chilren, calls itself for directories in it
 */
async function generateDirectory(directoryPath, source, directory) {
  const directoryChildren = source.directories.filter(d => d.directory_id == directory.id);
  const moduleChildren = source.modules.filter(m => m.directory_id == directory.id);

  // Create own directory
  const rootDirectoryPath = path.join(directoryPath, directory.title);
  await mkdir(rootDirectoryPath);

  // Create all children directories
  await Promise.all(directoryChildren.map(dir => generateDirectory(rootDirectoryPath, source, dir)));

  // Create all modules
  await Promise.all(moduleChildren.map(module => writeFile(path.join(rootDirectoryPath, module.title), module.code)));
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
  try {
    await Promise.all(rootDirectories.map(dir => generateDirectory(directory, source, dir)));
  } catch (e) {
    console.log('ha');
  }

  return directory;
}
