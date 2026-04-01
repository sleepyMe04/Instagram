const bannedWords = ['hate', 'kill', 'stupid', 'toxic', 'trash'];

const checkModeration = (req, res, next) => {
  const text = req.body.text.toLowerCase().trim();
  const found = bannedWords.some(word => text.includes(word));
  if (found) {
    return res.status(400).json({
      warning: true,
      message: '⚠️ Your comment contains inappropriate language and was rejected.'
    });
  }
  next();
};
module.exports = checkModeration;