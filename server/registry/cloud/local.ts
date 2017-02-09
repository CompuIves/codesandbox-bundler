import * as fs from 'fs';
import * as path from 'path';

import { log } from '../../utils/log';
import { createDirectoryRecursively } from '../../utils/directories';
import { CloudInterface } from './';

const ROOT_PATH = 'public/registry';

export function upload(filePath: string) {
  return new Promise((resolve, reject) => {
    log(`Moving ${filePath} to ${ROOT_PATH}`);

    createDirectoryRecursively(ROOT_PATH);
    try {
      const name = path.basename(filePath);
      fs.renameSync(filePath, path.join(ROOT_PATH, name));
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}
