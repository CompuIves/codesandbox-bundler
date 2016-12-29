import { storage } from 'google-cloud';

import { default as env } from './env';
import { CloudInterface } from './cloud';

const gcs = storage({
  projectId: 'codesandbox-153802',
  keyFilename: '/usr/.gcloud/codesandbox.json',
});

const bucket = gcs.bucket('bundles.codesandbox.io');

export function upload(filePath) {
  return new Promise((resolve, reject) => {
    console.log('Uploading to gcloud');
    bucket.upload(filePath, { gzip: true, public: true }, (err, file) => {
      if (err) return reject(err);

      console.log('Uploaded!');
      resolve(file);
    });
  });
}
