const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: { type: String, default: 'Anonymous' },
  imageUrl: { type: String, required: true },
  caption: { type: String },
  likes: { type: Number, default: 0 },
  reposts: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);