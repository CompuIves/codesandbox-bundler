import { createWriteStream } from 'fs';
import * as zlib from 'zlib';
import * as tar from 'tar-stream';
import { createDirectoryRecursively } from '../utils/directories';
import generatePackageJSON from './generate-package-json';
import { join, dirname } from 'path';
import * as babel from 'babel-core';

function transformCode(code: string) {
  return babel.transform(code, { presets: ['es2015', 'react', 'stage-0'] }).code;
}

/**
 * Add an entry to the tar
 */
function addEntry(packer: any, entry: Object, buffer?: Buffer): Promise<{}> {
  return new Promise((resolve, reject) => {
    packer.entry(entry, buffer, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Add file to the tar
 */
async function addEntryFile(packer, path, content) {
  await addEntry(packer, {
    name: path,
    type: 'file',
  }, Buffer.from(content, 'utf8'));
}

/**
 * Creates the directory with all chilren, calls itself for directories in it
 */
async function generateDirectory(packer, directoryPath: string, source, directoryId?: string) {
  const directoryChildren = source.directories.filter(d => d.directory_id == directoryId);
  const moduleChildren = source.modules.filter(m => m.directory_id == directoryId);

  // Create own directory
  await addEntry(packer, {
    name: directoryPath,
    type: 'directory',
  });

  // Create all children directories
  await Promise.all(directoryChildren.map(dir => generateDirectory(packer, join(directoryPath, dir.title), source, dir.id)));

  // Create all modules
  await Promise.all(moduleChildren.map(module => addEntryFile(packer, join(directoryPath, module.title), transformCode(module.code))));
}

/**
 * Generates a tar with all the files/directories of the version that's given. Moves it to the destionation
 * afterwards
 */
export default async function pack(version, packer = tar.pack()) {
  const compressor = packer.pipe(zlib.createGzip());

  await generateDirectory(packer, 'package', version.source);

  await addEntryFile(packer, 'package/package.json', JSON.stringify(generatePackageJSON(version)));

  packer.finalize();

  return compressor;
}
