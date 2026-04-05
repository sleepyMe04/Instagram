require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const { assignUsersToPostLikes } = require('./assignUsersToPostLikes');

async function assignLikesToExisting() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Set it in .env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  // Get all existing posts
  const existingPosts = await Post.find().select('_id author likes');
  
  if (existingPosts.length === 0) {
    console.log('❌ No posts found in database');
    mongoose.disconnect();
    return;
  }

  console.log(`📝 Found ${existingPosts.length} posts. Assigning random likes...`);

  const result = await assignUsersToPostLikes({
    posts: existingPosts,
    minLikes: 30,
    maxLikes: 40,
    targetUsers: 250,
    connect: false  // Already connected above
  });

  console.log(`✅ Assigned ${result.likesAssigned} likes across ${result.postsCount} posts`);
  console.log('✅ Changes saved permanently to MongoDB');

  mongoose.disconnect();
}

if (require.main === module) {
  assignLikesToExisting()
    .catch(err => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = { assignLikesToExisting };
