import { default as env } from '../../env';
import { CloudInterface } from './';
import { log } from '../../utils/log';
import gcs from '../../services/gcloud';

const bucket = gcs.bucket('bundles.codesandbox.io');

export function upload(filePath) {
  return new Promise((resolve, reject) => {
    log('Uploading to gcloud');
    bucket.upload(filePath, { gzip: true, public: true }, (err, file) => {
      if (err) return reject(err);

      log('Uploaded!');
      resolve(file);
    });
  });
}
