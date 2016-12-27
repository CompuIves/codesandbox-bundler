import * as redis from 'redis';
import { default as env } from './env';

const config = require(`../config/${env}.json`);

const client = redis.createClient({
  host: config.host
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
