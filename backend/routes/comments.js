const router = require('express').Router();
const Comment = require('../models/Comment');

// GET comments 
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


//only comment
router.post('/:postId', async (req, res) => {
  try {
    const comment = new Comment({
      postId: req.params.postId,
      author: req.body.author || 'Guest',
      text: req.body.text
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;