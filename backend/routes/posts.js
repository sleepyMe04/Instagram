const router = require('express').Router();
const Like = require('../models/Like');
const Post = require('../models/Post');
const Repost = require('../models/Repost');
const User = require('../models/User');

// GET all posts for the feed
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find().sort('-createdAt');
    const viewerId = req.query.viewerId;

    if (!viewerId) {
      return res.json(posts);
    }

    // Viewer actions
    const postIds = posts.map(post => post._id);
    const [likes, reposts] = await Promise.all([
      Like.find({ userId: viewerId, postId: { $in: postIds } }).select('postId'),
      Repost.find({ userId: viewerId, postId: { $in: postIds } }).select('postId caption')
    ]);

    const likedPostIds = new Set(likes.map(like => String(like.postId)));
    const repostMap = new Map(reposts.map(repost => [String(repost.postId), repost]));

    res.json(posts.map(post => {
      const repost = repostMap.get(String(post._id));
      return {
        ...post.toObject(),
        viewerHasLiked: likedPostIds.has(String(post._id)),
        viewerHasReposted: Boolean(repost),
        repostCaption: repost ? repost.caption : undefined
      };
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/likes', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('_id likes');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Liker lookup
    const likes = await Like.find({ postId: post._id })
      .populate('userId', 'username fullName avatarUrl isVerified')
      .sort('-createdAt');

    const users = likes
      .map(like => like.userId)
      .filter(Boolean)
      .map(user => ({
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified
      }));

    res.json({
      count: users.length || post.likes,
      users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIKE / UNLIKE toggle
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.body.userId) {
      // Save liker
      const userExists = await User.exists({ _id: req.body.userId });
      if (!userExists) return res.status(404).json({ message: 'User not found' });

      const existingLike = await Like.findOne({ postId: post._id, userId: req.body.userId });

      if (req.body.liked && !existingLike) {
        await Like.create({ postId: post._id, userId: req.body.userId });
      }

      if (!req.body.liked && existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
      }

      post.likes = await Like.countDocuments({ postId: post._id });
      await post.save();
      return res.json({ likes: post.likes, viewerHasLiked: req.body.liked });
    }

    const delta = req.body.liked ? 1 : -1;
    post.likes = Math.max(0, post.likes + delta);
    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// REPOST / UN-REPOST toggle
router.put('/:id/repost', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.body.userId) {
      // Save repost
      const userExists = await User.exists({ _id: req.body.userId });
      if (!userExists) return res.status(404).json({ message: 'User not found' });

      const existingRepost = await Repost.findOne({ postId: post._id, userId: req.body.userId });

      if (req.body.reposted) {
        const caption = typeof req.body.caption === 'string'
          ? req.body.caption
          : (existingRepost?.caption || '');

        if (existingRepost) {
          existingRepost.caption = caption;
          await existingRepost.save();
        } else {
          await Repost.create({ postId: post._id, userId: req.body.userId, caption });
        }
      } else if (existingRepost) {
        await Repost.deleteOne({ _id: existingRepost._id });
      }

      post.reposts = await Repost.countDocuments({ postId: post._id });
      await post.save();
      return res.json({
        reposts: post.reposts,
        viewerHasReposted: Boolean(req.body.reposted),
        repostCaption: req.body.reposted ? (req.body.caption || existingRepost?.caption || '') : undefined
      });
    }

    const delta = req.body.reposted ? 1 : -1;
    post.reposts = Math.max(0, post.reposts + delta);
    await post.save();
    res.json({ reposts: post.reposts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
