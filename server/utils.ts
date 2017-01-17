import * as fs from 'fs';
import * as hash from 'string-hash';
import * as rmdir from 'rimraf';

import { log } from './utils/log';

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

export function createHash(packages: { [key: string]: string }): string {
  if (!packages || Object.keys(packages).length === 0) {
    return null;
  }
  const packagesList = Object.keys(packages).map(function (key) {
    return key + ':' + packages[key];
  }).sort(function (a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  return String(hash(JSON.stringify(packagesList)));
}
