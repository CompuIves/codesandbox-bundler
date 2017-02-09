import { Context } from 'koa';
import * as fetchLatestVersion from 'latest-version';
import * as packageJson from 'package-json';
import * as semver from 'semver';

const isUrlVersion = (version) => /^[^\d]/.test(version);

export async function getAbsoluteVersion(ctx: Context, packageName: string, version: string) {
  if (version === 'latest') {
    const lastVersion = await fetchLatestVersion(packageName);
    return ctx.body = { version: lastVersion };
  }

  if (isUrlVersion(version)) {
    return ctx.body = { version };
  }

  // If version starts with a number it is a semver
  const data = await packageJson(packageName, version);
  return ctx.body = { version: data.version };
}
