require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Post.deleteMany({});
  await Post.insertMany([
    {
      author: 'traveler_joe',
      imageUrl: 'https://picsum.photos/seed/city/600/400',
      caption: 'City vibes 🌆',
      likes: 0,
      reposts: 0
    },
    {
      author: 'nature_shots',
      imageUrl: 'https://picsum.photos/seed/forest/600/400',
      caption: 'Into the woods 🌲',
      likes: 0,
      reposts: 0
    },
    {
      author: 'foodie_daily',
      imageUrl: 'https://picsum.photos/seed/food/600/400',
      caption: 'Brunch goals 🍳',
      likes: 0,
      reposts: 0
    }
  ]);
  console.log('✅ Seeded 3 sample posts!');
  mongoose.disconnect();
}).catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
