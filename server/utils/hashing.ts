import * as hash from 'string-hash';

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
