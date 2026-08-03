import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Please link like to a post'],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please link like to a user'],
    },
  },
  {
    timestamps: true,
  }
);

// Double like prevention index
likeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);
export default Like;
