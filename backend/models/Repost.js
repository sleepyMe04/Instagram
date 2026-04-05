const mongoose = require('mongoose');

// Repost mapping
const RepostSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    default: ''
  }
}, { timestamps: true });

RepostSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Repost', RepostSchema);
