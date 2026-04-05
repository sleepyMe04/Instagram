require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const firstNames = [
  'Ava', 'Liam', 'Noah', 'Emma', 'Mia', 'Lucas', 'Amelia', 'Ethan', 'Sophia',
  'Mason', 'Isabella', 'Elijah', 'Harper', 'Aria', 'James', 'Evelyn', 'Henry',
  'Scarlett', 'Jack', 'Layla', 'Daniel', 'Nora', 'Leo', 'Zoe', 'Julian'
];

const lastNames = [
  'Ahmed', 'Smith', 'Rahman', 'Khan', 'Brown', 'Taylor', 'Davis', 'Wilson',
  'Martin', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'King', 'Allen'
];

const adjectives = [
  'urban', 'daily', 'golden', 'quiet', 'bright', 'bold', 'coastal', 'hidden',
  'vivid', 'modern', 'wild', 'still', 'fresh', 'stellar', 'native', 'social'
];

const nouns = [
  'pixel', 'atlas', 'frame', 'garden', 'studio', 'drift', 'horizon', 'thread',
  'lens', 'signal', 'harbor', 'forest', 'spark', 'river', 'orbit', 'circle'
];

const locations = [
  'Dhaka, Bangladesh', 'New York, USA', 'Toronto, Canada', 'London, UK',
  'Tokyo, Japan', 'Sydney, Australia', 'Berlin, Germany', 'Dubai, UAE',
  'Singapore', 'Istanbul, Turkey', 'Paris, France', 'Seoul, South Korea'
];

const bioStarters = [
  'Sharing everyday moments',
  'Building things on the internet',
  'Coffee, cameras, and long walks',
  'Travel notes and quiet corners',
  'Design, code, and repeat',
  'Food explorer and weekend photographer',
  'Chasing light and good stories',
  'Making ordinary days look better'
];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolveCount(args) {
  const countArg = args.find(arg => arg.startsWith('--count='));
  const positionalCount = args.find(arg => /^\d+$/.test(arg));
  const rawCount = countArg ? countArg.split('=')[1] : positionalCount;

  if (!rawCount) {
    return randomInt(200, 300);
  }

  const count = Number(rawCount);
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('Count must be a positive integer.');
  }

  return count;
}

function generateUser(index, batchId) {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const adjective = randomItem(adjectives);
  const noun = randomItem(nouns);
  const suffix = `${batchId}${String(index + 1).padStart(3, '0')}`;
  const handleSuffix = suffix.slice(-8);
  const username = `${adjective}.${noun}.${handleSuffix}`.toLowerCase();

  return {
    username,
    email: `${username}@example.com`,
    fullName: `${firstName} ${lastName}`,
    bio: `${randomItem(bioStarters)}. #${adjective} #${noun}`,
    avatarUrl: `https://i.pravatar.cc/300?img=${(index % 70) + 1}`,
    location: randomItem(locations),
    website: `https://${noun}${handleSuffix}.example.com`,
    followersCount: randomInt(10, 25000),
    followingCount: randomInt(20, 1800),
    postsCount: randomInt(0, 240),
    isVerified: Math.random() < 0.08,
    isPrivate: Math.random() < 0.18
  };
}

function generateUsers(count, batchId = new Date().toISOString().replace(/\D/g, '').slice(0, 14)) {
  return Array.from({ length: count }, (_, index) => generateUser(index, batchId));
}

async function seedUsers({ count, reset = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Set it in the environment or backend/.env.');
  }

  const resolvedCount = count ?? randomInt(200, 300);

  await mongoose.connect(process.env.MONGO_URI);

  if (reset) {
    await User.deleteMany({});
    console.log('Cleared existing users collection');
  }

  const insertedUsers = await User.insertMany(generateUsers(resolvedCount));
  console.log(`Inserted ${insertedUsers.length} users into MongoDB`);
  return insertedUsers;
}

async function main() {
  const args = process.argv.slice(2);
  await seedUsers({
    count: resolveCount(args),
    reset: args.includes('--reset')
  });
}

if (require.main === module) {
  main()
    .catch(error => {
      console.error('User seed failed:', error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect().catch(() => {});
    });
}

module.exports = {
  generateUsers,
  resolveCount,
  seedUsers
};
