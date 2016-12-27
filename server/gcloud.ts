import { storage } from 'google-cloud';

const gcs = storage({
  projectId: 'codesandbox-153802',
  keyFilename: '/Users/i_van_hoorne/.gcloud/codesandbox.json',
});

const bucket = gcs.bucket('codesandbox-bundles');

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