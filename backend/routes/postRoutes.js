const express = require('express');
const router = express.Router();
const { createPost, getPosts, toggleLike, addComment, deletePost } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getPosts)
    .post(protect, createPost);

router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;
