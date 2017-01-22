import * as redis from 'redis';
import env from './env';

const client = redis.createClient({
  host: env === 'development' ? 'redis' : 'localhost',
});

const promiseResolver = (resolve, reject) => (err, reply) => {
  if (err) return reject(err);

  resolve(reply);
};

export function isInQueue(hash) {
  return new Promise((resolve, reject) => {
    client.get(`queue:${hash}`, promiseResolver(resolve, reject));
  });
}

export function addToQueue(hash) {
  return new Promise((resolve, reject) => {
    client.set(`queue:${hash}`, true, promiseResolver(resolve, reject));
  });
}

export function removeFromQueue(hash) {
  return new Promise((resolve, reject) => {
    client.del(`queue:${hash}`, promiseResolver(resolve, reject));
  });
}

/**
 * Save an error for a bundle, error is saved for 60 seconds
 */
export function saveBundleError(hash, error: Error) {
  const expireDuration = 60;
  const data = JSON.stringify({ error: `${error.name} ${error.message}` });
  return new Promise((resolve, reject) => {
    client.setex(`bundle:${hash}`, expireDuration, data, promiseResolver(resolve, reject));
  });
}

export function saveBundleInfo(hash, manifest) {
  return new Promise((resolve, reject) => {
    client.set(`bundle:${hash}`, manifest, promiseResolver(resolve, reject));
  });
}

export function getBundleInfo(hash): Promise<string> {
  return new Promise((resolve, reject) => {
    client.get(`bundle:${hash}`, promiseResolver(resolve, reject));
  });
}
