import env from '../../env';

import * as local from './local';
import * as gcloud from './gcloud';
// import * as s3 from './s3';

export interface CloudInterface {
  upload: (filePath: string) => Promise<any>;
}

export default env === 'production' ? gcloud : local;
