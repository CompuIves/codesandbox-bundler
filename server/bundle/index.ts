import { Context } from 'koa';
import * as fs from 'mz/fs';
import * as path from 'path';
import { exec } from 'mz/child_process';
import axios from 'axios';

import env from '../env';
import bundle from './webpack';
import { log } from '../utils/log';
import { deleteDirectory, createDirectoryRecursively } from '../utils/directories';
import { createHash } from '../utils/hashing';
// import { upload } from './s3';
import cloud from './cloud';
import { isInQueue, addToQueue, removeFromQueue, saveBundleInfo, getBundleInfo, saveBundleError } from '../redis';

export const TEMP_ROOT = 'temp/bundles';

const generatePackageJSON = (packages): string => (
  JSON.stringify({
    name: 'dependencies',
    dependencies: packages,
  })
);

const sandboxUrl = (id: string) => (
  env === 'development' ?
    `http://nginx/api/v1/sources/${id}/dependencies`
  : `https://codesandbox.io/api/v1/sources/${id}/dependencies`
);

const generateURL = (hash: string) => (
  env === 'development' ?
    `http://bundles.codesandbox.dev/${hash}.js`
  : `https://bundles.codesandbox.io/${hash}.js`
);

const createBundleResponse = (cachedBundle, url, hash, ctx) => {
  if (cachedBundle.error) {
    ctx.status = 500;
    ctx.body = JSON.stringify(cachedBundle);
  } else {
    ctx.body = JSON.stringify({ url, hash, manifest: cachedBundle });
  }
}

async function bundleDependencies(hash: string, packages) {
  try {
    await addToQueue(hash);
    const startTime = +new Date();

    const directory = `${TEMP_ROOT}/${hash}`;
    const packageJSON = generatePackageJSON(packages);
    const dependencies = Object.keys(packages);

    await installDependencies(directory, packageJSON);
    await bundle(hash, dependencies, directory);

    const endTime = +new Date();

    log(`Bundled ${hash} in ${endTime - startTime}ms`);

    // --- AWS ---
    // const fileContents = await fs.readFile(path.join(directory, `${hash}.js`));
    // await upload(`${hash}.js`, fileContents);
    // --- AWS ---

    await cloud.upload(path.join(directory, `${hash}.js`));

    const manifest = await fs.readFile(path.join(directory, 'manifest.json'));

    await saveBundleInfo(hash, manifest);
    await removeFromQueue(hash);

    await deleteDirectory(directory);
  } catch (e) {
    await saveBundleError(hash, e);
    await removeFromQueue(hash);
    console.error(e);
  }
}

async function installDependencies(directory: string, packageJSON: string) {
  await createDirectoryRecursively(directory);

  await fs.writeFile(`${directory}/package.json`, packageJSON);

  // Ignore scripts is MUCH safer, will keep this on until we dockerize this application
  await exec(`cd ${directory} && yarn --no-lockfile --ignore-scripts`);
}

export async function post(ctx) {
  const { id } = ctx.request.body;

  if (id == null) throw new Error('Invalid Sandbox ID');

  const response = await axios({
    url: sandboxUrl(id),
    method: 'GET'
  });

  const packages = response.data.npm_dependencies;

  const hash: string = createHash(packages);
  const url: string = generateURL(hash);

  const cachedBundle = JSON.parse(await getBundleInfo(hash));
  if (cachedBundle) {
    createBundleResponse(cachedBundle, url, hash, ctx);
    return;
  }

  // Caching stuff
  if (!(await isInQueue(hash))) {
    log(`${hash} not in queue, starting to bundle.`);
    // This will be done in the background
    bundleDependencies(hash, packages);
  }

  ctx.body = JSON.stringify({ url, hash, processing: true });
}

export async function get(ctx: Context, hash) {
  if (hash == null) throw new Error('No hash provided');

  const url = generateURL(hash);

  const cachedBundle = JSON.parse(await getBundleInfo(hash));
  if (cachedBundle) {
    createBundleResponse(cachedBundle, url, hash, ctx);
    return;
  }

  const inQueue = await isInQueue(hash);
  ctx.body = JSON.stringify({ url, hash, processing: !!inQueue });
}
