import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getLikeStatus,
  addComment,
  updateComment,
  deleteComment,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup Multer Storage for Post Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Images only (jpg, jpeg, png, webp)!'));
  },
});

// Protect all routes
router.use(protect);

// Post CRUD
router.route('/')
  .post(upload.single('image'), createPost)
  .get(getPosts);

router.route('/:id')
  .put(updatePost)
  .delete(deletePost);

// Like operations
router.post('/:post_id/like', likePost);
router.post('/:post_id/unlike', unlikePost);
router.get('/:post_id/like-status', getLikeStatus);

// Comment operations
router.post('/:post_id/comments', addComment);
router.put('/comments/:comment_id', updateComment);
router.delete('/comments/:comment_id', deleteComment);

export default router;
