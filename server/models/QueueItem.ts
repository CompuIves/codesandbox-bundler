import { Schema } from 'mongoose';

const QueueItem = new Schema({
  hash: String
});

export default QueueItem;
