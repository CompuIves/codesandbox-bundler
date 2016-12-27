import { Context } from 'koa';
import * as fs from 'mz/fs';
import * as path from 'path';
import { exec } from 'mz/child_process';

import { default as bundle } from './webpack';
import { createHash, deleteDirectory, createDirectoryRecursively } from './utils';
// import { upload } from './s3';
import { upload } from './gcloud';
import { isInQueue, addToQueue, removeFromQueue, saveBundleInfo, getBundleInfo } from './redis';

const TEMP_ROOT = 'temp';

const generatePackageJSON = (name, packages): string => (
  JSON.stringify({
    name,
    dependencies: packages,
  })
);

async function bundleDependencies(name: string, hash: string, packages) {
  try {
    await addToQueue(hash);
    const startTime = +new Date();

    const directory = `${TEMP_ROOT}/${hash}`;
    const packageJSON = generatePackageJSON(name, packages);

    await installDependencies(directory, packageJSON);

    const dependencies = Object.keys(packages);
    await bundle(hash, dependencies, directory);

    const endTime = +new Date();

    console.log(`Bundled ${hash} in ${endTime - startTime}ms`);

    // --- AWS ---
    // const fileContents = await fs.readFile(path.join(directory, `${hash}.js`));
    // await upload(`${hash}.js`, fileContents);
    // --- AWS ---

    await upload(path.join(directory, `${hash}.js`));

    const manifest = await fs.readFile(path.join(directory, 'manifest.json'));

    await saveBundleInfo(hash, manifest);
    await removeFromQueue(hash);

    await deleteDirectory(directory);
  } catch (e) {
    console.error(e);
  }
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

  const cachedBundle = JSON.parse(await getBundleInfo(hash));
  if (cachedBundle) {
    ctx.body = JSON.stringify({ hash, manifest: cachedBundle });
    return;
  }

  // Caching stuff
  if (!(await isInQueue(hash))) {
    console.log(`${hash} not in queue, starting to bundle.`);
    // This will be done in the background
    bundleDependencies(name, hash, packages);
  }

  ctx.body = JSON.stringify({ hash, processing: true });
}
