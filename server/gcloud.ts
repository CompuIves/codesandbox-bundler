import { storage } from 'google-cloud';

import { default as env } from './env';

const gcs = storage({
  projectId: 'codesandbox-153802',
  keyFilename: '/usr/.gcloud/codesandbox.json',
});

const bucket = gcs.bucket('codesandbox-bundles');

export function upload(filePath) {
  return new Promise((resolve, reject) => {
    if (env === 'production') {
      console.log('Uploading to gcloud');
      bucket.upload(filePath, { gzip: true, public: true }, (err, file) => {
        if (err) return reject(err);

        console.log('Uploaded!');
        resolve(file);
      });
    } else {
      console.log(`Would upload ${filePath}`);
      resolve();
    }
  });
}
