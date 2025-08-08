
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
}, { "collection": 'User' });

const ImageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imgDesc: { type: String, required: true },
  images:
  {
    data: Buffer,
    contentType: { type: String, default: 'image/jpeg' }
  }
  ,
  createdAt: { type: Date, default: Date.now }
}, { "collection": 'SavedImages' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Image = mongoose.models.Image || mongoose.model('Image', ImageSchema);

export { User, Image };
