import * as cluster from 'cluster';
import * as os from 'os';

import app from './app';

const PORT = 2000;
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  })
} else {
  app.listen(PORT);

  console.log(`Worker ${process.pid} started`);
}
