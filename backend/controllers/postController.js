import Post from '../models/Post.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';

// @desc    Create a new post (Owner/Trainer only)
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    // Validate role: Member gets 403 error
    if (req.user.role === 'member') {
      res.status(403);
      throw new Error('Members are not allowed to create posts');
    }

    if (!req.file && !req.body.image_url) {
      res.status(400);
      throw new Error('Please upload or provide an image URL');
    }

    if (!caption) {
      res.status(400);
      throw new Error('Please add a caption');
    }

    const image_url = req.file 
      ? `/uploads/${req.file.filename}` 
      : req.body.image_url;

    const post = await Post.create({
      gym_id: req.user.gym_id,
      author_id: req.user.id,
      author_role: req.user.role,
      image_url,
      caption,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author_id', 'name email role');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get all posts for a gym
// @route   GET /api/posts
// @access  Private
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ gym_id: req.user.gym_id })
      .sort({ created_date: -1 })
      .populate('author_id', 'name email role');

    // Get all likes and comments for each post
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countDocuments({ post_id: post._id });
        const hasLiked = await Like.exists({ post_id: post._id, user_id: req.user.id });
        const comments = await Comment.find({ post_id: post._id })
          .sort({ created_date: 1 })
          .populate('user_id', 'name email role');

        return {
          ...post._doc,
          likeCount,
          hasLiked: !!hasLiked,
          comments,
        };
      })
    );

    res.json(postsWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a post (Original author only)
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const { caption } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Only original author can edit
    if (post.author_id.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Only the original author can edit this post');
    }

    post.caption = caption || post.caption;
    const updatedPost = await post.save();

    const populatedPost = await Post.findById(updatedPost._id)
      .populate('author_id', 'name email role');

    // Retrieve stats
    const likeCount = await Like.countDocuments({ post_id: post._id });
    const hasLiked = await Like.exists({ post_id: post._id, user_id: req.user.id });
    const comments = await Comment.find({ post_id: post._id })
      .sort({ created_date: 1 })
      .populate('user_id', 'name email role');

    res.json({
      ...populatedPost._doc,
      likeCount,
      hasLiked: !!hasLiked,
      comments,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete a post (Author or shared moderation: Owner/Trainer)
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const isAuthor = post.author_id.toString() === req.user.id;
    const isModerator = req.user.role === 'owner' || req.user.role === 'trainer';

    if (!isAuthor && !isModerator) {
      res.status(403);
      throw new Error('Not authorized to delete this post');
    }

    // Delete post, comments and likes
    await Promise.all([
      post.deleteOne(),
      Comment.deleteMany({ post_id: post._id }),
      Like.deleteMany({ post_id: post._id }),
    ]);

    res.json({ message: 'Post successfully deleted' });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Like a post
// @route   POST /api/posts/:post_id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await Post.findById(post_id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Create like (will fail if duplicate due to unique index)
    try {
      await Like.create({ post_id, user_id: req.user.id });
    } catch (err) {
      // Ignore duplicate key errors (already liked)
      if (err.code !== 11000) {
        throw err;
      }
    }

    const likeCount = await Like.countDocuments({ post_id });
    res.json({ liked: true, likeCount });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Unlike a post
// @route   POST /api/posts/:post_id/unlike
// @access  Private
export const unlikePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    await Like.findOneAndDelete({ post_id, user_id: req.user.id });

    const likeCount = await Like.countDocuments({ post_id });
    res.json({ liked: false, likeCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get like status of a post
// @route   GET /api/posts/:post_id/like-status
// @access  Private
export const getLikeStatus = async (req, res) => {
  try {
    const { post_id } = req.params;
    const likeCount = await Like.countDocuments({ post_id });
    const hasLiked = await Like.exists({ post_id, user_id: req.user.id });

    res.json({ likeCount, hasLiked: !!hasLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment
// @route   POST /api/posts/:post_id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { comment_text } = req.body;

    if (!comment_text) {
      res.status(400);
      throw new Error('Comment text is required');
    }

    const comment = await Comment.create({
      post_id,
      user_id: req.user.id,
      comment_text,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user_id', 'name email role');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Edit comment (Original commenter only)
// @route   PUT /api/comments/:comment_id
// @access  Private
export const updateComment = async (req, res) => {
  try {
    const { comment_text } = req.body;
    const comment = await Comment.findById(req.params.comment_id);

    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    if (comment.user_id.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Only the original commenter can edit their comment');
    }

    comment.comment_text = comment_text || comment.comment_text;
    const updatedComment = await comment.save();

    const populatedComment = await Comment.findById(updatedComment._id)
      .populate('user_id', 'name email role');

    res.json(populatedComment);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete comment (Commenter or shared moderation: Owner/Trainer)
// @route   DELETE /api/comments/:comment_id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.comment_id);

    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    const isCommenter = comment.user_id.toString() === req.user.id;
    const isModerator = req.user.role === 'owner' || req.user.role === 'trainer';

    if (!isCommenter && !isModerator) {
      res.status(403);
      throw new Error('Not authorized to delete this comment');
    }

    await comment.deleteOne();
    res.json({ message: 'Comment successfully deleted' });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};
