import * as fs from 'fs';
import * as path from 'path';
import { createDirectoryRecursively } from './utils';
import { CloudInterface } from './cloud';

export function upload(filePath: string) {
  return new Promise((resolve, reject) => {
    console.log(`Moving ${filePath} to public`);

    createDirectoryRecursively('public');
    try {
      const name = path.basename(filePath);
      fs.renameSync(filePath, path.join('public', name));
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}
