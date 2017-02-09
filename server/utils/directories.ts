import * as fs from 'fs';
import * as rmdir from 'rimraf';
import { log } from './log';

/**
 * Creates a directory, if the parent directories don't exist yet they will be created as well
 */
export function createDirectoryRecursively(directory: string) {
  const directories = directory.split('/');

  directories.filter(x => x).reduce((prev, next) => {
    const directory = `${prev}${next}/`
    const exists = fs.existsSync(directory);
    if (!exists) {
      log('creating ' + directory);
      fs.mkdirSync(directory);
    }

    return directory;
  }, directories[0] === '' ? '/' : '');
}

/**
 * Deletes the given directory
 */
export function deleteDirectory(directory: string) {
  log(`Deleting ${directory}`);
  return new Promise((resolve, reject) => {
    rmdir(directory, (err) => {
      if (err) return reject(err);

      resolve();
    });
  });
}
