import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Please link post to a gym branch'],
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify post author'],
    },
    author_role: {
      type: String,
      enum: ['owner', 'trainer'],
      required: [true, 'Author role must be either owner or trainer'],
    },
    image_url: {
      type: String,
      required: [true, 'An image is required for the community post'],
    },
    caption: {
      type: String,
      required: [true, 'Please add a caption to your post'],
      trim: true,
    },
    created_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
