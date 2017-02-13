import * as path from 'path';
import { tmpdir } from 'os';

import getAuthorUsername from './utils/author-name';
import { createDirectoryRecursively, deleteDirectory } from '../utils/directories';
import { writeFile, mkdir } from 'mz/fs';

export const TEMP_ROOT = `${tmpdir()}/registry`;

/**
 * Creates the directory with all chilren, calls itself for directories in it
 */
async function generateDirectory(directoryPath: string, source, directoryId?: string) {
  const directoryChildren = source.directories.filter(d => d.directory_id == directoryId);
  const moduleChildren = source.modules.filter(m => m.directory_id == directoryId);

  // Create own directory
  await createDirectoryRecursively(directoryPath);

  // Create all children directories
  await Promise.all(directoryChildren.map(dir => generateDirectory(path.join(directoryPath, dir.title), source, dir.id)));

  // Create all modules
  await Promise.all(moduleChildren.map(module => writeFile(path.join(directoryPath, module.title), module.code)));
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

  await generateDirectory(directory, source);

  return directory;
}
