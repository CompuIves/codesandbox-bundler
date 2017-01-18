import * as fs from 'fs';
import * as rmdir from 'rimraf';
import { log } from './log';

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

export function deleteDirectory(directory: string) {
  log(`Deleting ${directory}`);
  return new Promise((resolve, reject) => {
    rmdir(directory, (err) => {
      if (err) return reject(err);

      resolve();
    });
  });
}
