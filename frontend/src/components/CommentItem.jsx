import { useState } from 'react';

const bannedWords = ['hate', 'kill', 'slur1', 'slur2'];

export default function CommentItem({ comment }) {
  const [showReply, setShowReply] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [warning, setWarning] = useState('');

  const submitReply = () => {
    if (!replyText.trim()) return;
    if (bannedWords.some(w => replyText.toLowerCase().includes(w))) {
      setWarning(' Inappropriate language detected.');
      return;
    }
    setWarning('');
    setReplies(prev => [...prev, {
      _id: Date.now().toString(),
      author: 'you',
      text: replyText,
      time: 'now',
    }]);
    setReplyText('');
    setShowReply(false);
  };

  return (
    <div className="ig-comment">
      {/* Comment text */}
      <div>
        <span className="ig-comment-user">{comment.author}</span>
        {comment.text}
      </div>

      {/* Time + reply button */}
      <div className="ig-comment-actions">
        {comment.time && <span className="ig-comment-time">{comment.time}</span>}
        <button className="ig-reply-btn" onClick={() => setShowReply(r => !r)}>
          Reply
        </button>
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="ig-replies">
          {replies.map(r => (
            <div key={r._id} className="ig-reply">
              <span className="ig-comment-user">{r.author}</span>{r.text}
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {showReply && (
        <div className="ig-reply-input-wrap">
          <input
            autoFocus
            value={replyText}
            onChange={e => { setReplyText(e.target.value); setWarning(''); }}
            onKeyDown={e => e.key === 'Enter' && submitReply()}
            placeholder={`Reply to ${comment.author}…`}
          />
          <button
            className="ig-reply-post-btn"
            onClick={submitReply}
            disabled={!replyText.trim()}
          >
            Post
          </button>
        </div>
      )}

      {warning && (
        <div style={{ fontSize: 12, color: '#e74c3c', paddingLeft: 24, paddingBottom: 4 }}>
          {warning}
        </div>
      )}
    </div>
  );
}