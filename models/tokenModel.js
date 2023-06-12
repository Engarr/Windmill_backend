import mongoose from 'mongoose';

export const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    index: { expires: '1h' },
    required: true,
  },
});

export default mongoose.model('TokenModel', tokenSchema);
