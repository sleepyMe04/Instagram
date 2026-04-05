const router = require('express').Router();
const User = require('../models/User');

// Demo identity
const DEMO_USER = {
  username: 'you.demo',
  email: 'you.demo@example.com',
  fullName: 'You',
  bio: 'Local demo account',
  avatarUrl: 'https://i.pravatar.cc/300?u=you.demo',
  location: 'Dhaka, Bangladesh',
  website: '',
  followersCount: 128,
  followingCount: 96,
  postsCount: 4,
  isVerified: false,
  isPrivate: false
};

async function ensureDemoUser() {
  let user = await User.findOne({ username: DEMO_USER.username });
  if (!user) {
    user = await User.create(DEMO_USER);
  }
  return user;
}

// Current viewer
router.get('/me', async (req, res) => {
  try {
    const user = await ensureDemoUser();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
