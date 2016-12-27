import { Context } from 'koa';
import * as fs from 'mz/fs';
import * as path from 'path';
import { exec } from 'mz/child_process';

import { default as bundle } from './webpack';
import { createHash, createDirectoryRecursively } from './utils';
// import { upload } from './s3';
import { upload } from './gcloud';

const TEMP_ROOT = 'temp';

const generatePackageJSON = (name, packages): string => (
  JSON.stringify({
    name,
    dependencies: packages,
  })
);

async function bundleDependencies(name: string, hash: string, packages) {
  const startTime = +new Date();

  const directory = `${TEMP_ROOT}/${hash}`;
  const packageJSON = generatePackageJSON(name, packages);

  await installDependencies(directory, packageJSON);

  const dependencies = Object.keys(packages);
  await bundle(hash, dependencies, directory);

  const endTime = +new Date();

  console.log(`Bundled ${hash} in ${endTime - startTime}ms`);


  // const fileContents = await fs.readFile(path.join(directory, `${hash}.js`));

  // await upload(`${hash}.js`, fileContents);
  await upload(path.join(directory, `${hash}.js`));
}

async function installDependencies(directory: string, packageJSON: string) {
  await createDirectoryRecursively(directory);

  await fs.writeFile(`${directory}/package.json`, packageJSON);

  await exec(`cd ${directory} && yarn --no-lockfile`);
}

export default async (ctx) => {
  const { name, packages } = ctx.request.body;

  if (name == null || packages == null) throw new Error('Invalid argument body');

  const hash: string = createHash(packages);

  // Caching stuff


  // This will be done in the background
  bundleDependencies(name, hash, packages);

  ctx.body = JSON.stringify({ hash, processing: true });
}
