import { Schema } from 'mongoose';

const DependencyBundle = new Schema({
  hash: String,
  manifest: Object,
  bundle: String
});

export default DependencyBundle;
