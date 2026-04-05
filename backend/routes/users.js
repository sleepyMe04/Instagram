const router = require('express').Router();
const User = require('../models/User');

// Demo identity
const DEMO_USER = {
  username: '_mld_',
  email: 'mld.demo@example.com',
  fullName: '_mld_',
  bio: 'Local demo account',
  avatarUrl: 'https://i.pravatar.cc/300?u=_mld_',
  location: 'Dhaka, Bangladesh',
  website: '',
  followersCount: 128,
  followingCount: 96,
  postsCount: 4,
  isVerified: false,
  isPrivate: false
};

async function ensureDemoUser() {
  let user = await User.findOne({
    $or: [
      { username: DEMO_USER.username },
      { username: 'you.demo' },
      { email: DEMO_USER.email },
      { email: 'you.demo@example.com' }
    ]
  });

  if (!user) {
    user = await User.create(DEMO_USER);
  } else {
    Object.assign(user, DEMO_USER);
    await user.save();
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
