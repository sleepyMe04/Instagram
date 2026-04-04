const router = require('express').Router();
const Comment = require('../models/Comment');
const checkModeration = require('../middleware/moderation');

// GET top-level comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
      parentCommentId: null
    }).sort('createdAt');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET replies for a comment
router.get('/:postId/replies/:commentId', async (req, res) => {
  try {
    const replies = await Comment.find({
      postId: req.params.postId,
      parentCommentId: req.params.commentId
    }).sort('createdAt');
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a comment or reply (with moderation)
router.post('/:postId', checkModeration, async (req, res) => {
  try {
    const comment = new Comment({
      postId: req.params.postId,
      author: req.body.author || 'Guest',
      text: req.body.text,
      parentCommentId: req.body.parentCommentId || null
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;