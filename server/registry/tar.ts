import * as targz from 'targz';
import { createDirectoryRecursively } from  '../utils/directories';
import { dirname } from 'path';

export default function tar(source, destination: string): Promise<string> {
  createDirectoryRecursively(dirname(destination));
  return new Promise((resolve, reject) => {
    targz.compress({
      src: source,
      dest: destination,
    }, function (err) {
      if (err) reject(err);

      resolve(destination);
    });
  });
}
