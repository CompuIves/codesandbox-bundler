import * as path from 'path';
import { writeFile } from 'mz/fs';
import { readFileSync } from 'fs';
import * as crypto from 'crypto';
import { tmpdir } from 'os';
import { basename } from 'path';

import generateFiles from './generate-files';
import generatePackageJson from './generate-package-json';
import generateAuthorName from './utils/author-name';
import { deleteDirectory } from '../utils/directories';
import tar from './tar';
import cloud from './cloud';
import env from '../env';

const generateURL = (filename: string) => (
  env === 'development' ?
    `http://bundles.codesandbox.dev/${filename}`
  : `https://bundles.codesandbox.io/${filename}`
);

export default async function(ctx) {
  const version = ctx.request.body;

  const directory = await generateFiles(version);
  const packageJSON = await generatePackageJson(version);

  await writeFile(path.join(directory, 'package.json'), `${JSON.stringify(packageJSON)}`);

  const tarDest = path.join(tmpdir(), 'registrytars', `${generateAuthorName(version.sandbox.author)}-${version.sandbox.slug}-${version.version}.tgz`);
  const tarPath = await tar(directory, tarDest);

  const buffer = readFileSync(tarPath);
  const shasum = crypto.createHash('sha1').update(buffer).digest('hex');

  await cloud.upload(tarPath);

  // Cleanup
  deleteDirectory(directory);

  ctx.body = {
    tarball: generateURL(basename(tarPath)),
    shasum,
  };
}
