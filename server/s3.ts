import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'codesandbox.bundles';
const s3 = new AWS.S3({
  region: 'eu-central-1',
  params: {
    Bucket: BUCKET_NAME,
  },
});

export function upload(filename, contents) {
  console.log(`Uploading ${filename} to S3`);
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: contents,
    ACL: 'public-read',
  };

  return new Promise((resolve, reject) => {
    s3.upload(s3Params, (err, data) => {
      if (err) return reject(err);

      console.log(`Uploaded ${filename} with message: ${JSON.stringify(data)}`);
      resolve(data);
    });
  });
}
