import * as fs from 'fs';
import * as rmdir from 'rimraf';
import { log } from './log';

/**
 * Creates a directory, if the parent directories don't exist yet they will be created as well
 */
export function createDirectoryRecursively(directory: string) {
  const directories = directory.split('/').filter(x => x);

  directories.reduce((prev, next) => {
    const exists = fs.existsSync(prev + next);
    if (!exists) {
      log('creating ' + prev + next);
      fs.mkdirSync(prev + next);
    }

    return `${prev}${next}/`;
  }, '');
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
