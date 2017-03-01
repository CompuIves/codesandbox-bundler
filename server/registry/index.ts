import * as path from 'path';
import { writeFile } from 'mz/fs';
import { readFileSync, createWriteStream } from 'fs';
import * as crypto from 'crypto';
import { tmpdir } from 'os';
import { basename, dirname } from 'path';

import generatePackageJson from './generate-package-json';
import generateAuthorName from './utils/author-name';
import { createDirectoryRecursively, deleteDirectory } from '../utils/directories';
import generateTar from './generate-tar';
import cloud from './cloud';
import env from '../env';

const generateURL = (filename: string) => (
  env === 'development' ?
    `http://bundles.codesandbox.dev/registry/${filename}`
  : `https://bundles.codesandbox.io/${filename}`
);

export default async function(ctx) {
  const version = ctx.request.body;

  const destination = path.join(tmpdir(), 'registrytars', `${generateAuthorName(version.sandbox.author)}-${version.sandbox.slug}-${version.version}.tgz`);
  await createDirectoryRecursively(dirname(destination));

  const compressor = await generateTar(version);

  await new Promise((resolve, reject) => {
    compressor.pipe(createWriteStream(destination));
    compressor.on('error', reject);
    compressor.on('close', resolve);
  });

  const buffer = readFileSync(destination);
  const shasum = crypto.createHash('sha1').update(buffer).digest('hex');

  await cloud.upload(destination);

  ctx.body = {
    tarball: generateURL(basename(destination)),
    shasum,
  };
}
