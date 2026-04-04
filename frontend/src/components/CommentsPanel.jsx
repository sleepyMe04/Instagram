import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const bannedWords = ['hate', 'kill', 'slur1', 'slur2'];
const MY_AVATAR = 'https://i.pravatar.cc/32?img=1';

// ── Single reply row ──────────────────────────────────────────────────────────
function ReplyRow({ reply }) {
  const avatar = reply.author === 'you'
    ? MY_AVATAR
    : `https://i.pravatar.cc/28?u=${reply.author}`;
  return (
    <div className="cp-reply-row">
      <img src={avatar} alt={reply.author} className="cp-av cp-av-sm" />
      <div className="cp-reply-body">
        <span className="cp-uname">{reply.author}</span>{' '}{reply.text}
      </div>
    </div>
  );
}

// ── Single top-level comment + its threaded replies ───────────────────────────
function CommentThread({ comment, postId, replies, onAddReply, onReplyTo }) {
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [fetched, setFetched]         = useState(false);

  const avatar = comment.author === 'you'
    ? MY_AVATAR
    : `https://i.pravatar.cc/36?u=${comment.author}`;

  const handleToggleReplies = async () => {
    if (fetched) { setShowReplies(s => !s); return; }
    setLoading(true);
    try {
      const res = await api.get(`/comments/${postId}/replies/${comment._id}`);
      // merge server replies with any locally-added ones already in `replies`
      const serverIds = new Set(res.data.map(r => r._id));
      const merged = [
        ...res.data,
        ...replies.filter(r => !serverIds.has(r._id)),
      ];
      onAddReply(comment._id, merged, true); // true = replace
    } catch {
      /* ignore – local replies still visible */
    }
    setFetched(true);
    setShowReplies(true);
    setLoading(false);
  };

  const totalReplies = replies.length;

  return (
    <div className="cp-thread">
      {/* Main comment row */}
      <div className="cp-comment-row">
        <img src={avatar} alt={comment.author} className="cp-av" />
        <div className="cp-comment-body">
          <p className="cp-comment-text">
            <span className="cp-uname">{comment.author}</span>{' '}{comment.text}
          </p>
          <div className="cp-comment-meta">
            {comment.time && <span className="cp-time">{comment.time}</span>}
            <button className="cp-reply-trigger" onClick={() => onReplyTo(comment)}>
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* View / hide replies toggle */}
      {totalReplies > 0 && (
        <button className="cp-toggle-replies" onClick={handleToggleReplies}>
          <span className="cp-dash" />
          {loading
            ? 'Loading…'
            : showReplies
              ? 'Hide replies'
              : `View ${totalReplies} repl${totalReplies === 1 ? 'y' : 'ies'}`}
        </button>
      )}

      {/* Threaded reply list */}
      {showReplies && replies.length > 0 && (
        <div className="cp-replies-indent">
          {replies.map(r => <ReplyRow key={r._id} reply={r} />)}
        </div>
      )}
    </div>
  );
}

// ── CommentsPanel ─────────────────────────────────────────────────────────────
export default function CommentsPanel({
  post,
  comments,        // lifted state from PostCard
  repliesMap,      // lifted state: { [commentId]: Reply[] }
  onAddComment,    // (comment) => void
  onAddReply,      // (commentId, repliesOrReply, replace?) => void
  onClose,
}) {
  const [loading, setLoading]       = useState(false);
  const [fetched, setFetched]       = useState(comments.length > 0);
  const [inputText, setInputText]   = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [warning, setWarning]       = useState('');
  const inputRef  = useRef(null);
  const listRef   = useRef(null);

  // Fetch comments from server on first open
  useEffect(() => {
    if (fetched) return;
    setLoading(true);
    api.get(`/comments/${post._id}`)
      .then(res => { res.data.forEach(c => onAddComment(c, true)); })
      .catch(() => { /* keep whatever local comments exist */ })
      .finally(() => { setLoading(false); setFetched(true); });
  }, []);   // eslint-disable-line

  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  const handleSubmit = async () => {
    const text = inputText.trim();
    if (!text) return;
    if (bannedWords.some(w => text.toLowerCase().includes(w))) {
      setWarning('⚠️ Comment contains inappropriate language.'); return;
    }
    setWarning('');

    if (replyingTo) {
      const optimistic = {
        _id: `local-${Date.now()}`,
        author: 'you',
        text,
      };
      // Add optimistically right away
      onAddReply(replyingTo._id, [optimistic]);
      setReplyingTo(null);
      setInputText('');
      try {
        const res = await api.post(`/comments/${post._id}`, {
          author: 'you', text, parentCommentId: replyingTo._id,
        });
        // Replace optimistic with server response
        onAddReply(replyingTo._id, [res.data], false, optimistic._id);
      } catch (err) {
        if (err.response?.data?.warning) setWarning(err.response.data.message);
      }
    } else {
      const optimistic = {
        _id: `local-${Date.now()}`,
        author: 'you',
        text,
        time: 'now',
      };
      onAddComment(optimistic);
      setInputText('');
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 80);
      try {
        await api.post(`/comments/${post._id}`, { author: 'you', text });
      } catch (err) {
        if (err.response?.data?.warning) setWarning(err.response.data.message);
      }
    }
  };

  const handleReplyTo = (comment) => {
    setReplyingTo(comment);
    setInputText(`@${comment.author} `);
    inputRef.current?.focus();
  };

  return (
    <div className="cp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cp-panel">

        {/* ── Header ── */}
        <div className="cp-header">
          <div className="cp-drag-handle" />
          <span className="cp-title">Comments</span>
          <button className="cp-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Post strip ── */}
        <div className="cp-post-strip">
          <img src={`https://i.pravatar.cc/32?u=${post.author}`} alt={post.author} className="cp-av" />
          <div className="cp-strip-text">
            <span className="cp-uname">{post.author}</span>{' '}
            <span className="cp-strip-caption">{post.caption}</span>
          </div>
        </div>

        {/* ── List ── */}
        <div className="cp-list" ref={listRef}>
          {loading ? (
            <div className="cp-empty">Loading comments…</div>
          ) : comments.length === 0 ? (
            <div className="cp-empty">
              <p className="cp-empty-h">No comments yet.</p>
              <p className="cp-empty-s">Be the first to comment.</p>
            </div>
          ) : (
            comments.map(c => (
              <CommentThread
                key={c._id}
                comment={c}
                postId={post._id}
                replies={repliesMap[c._id] || []}
                onAddReply={onAddReply}
                onReplyTo={handleReplyTo}
              />
            ))
          )}
        </div>

        {/* ── Warning ── */}
        {warning && <div className="cp-warning">{warning}</div>}

        {/* ── Replying-to pill ── */}
        {replyingTo && (
          <div className="cp-replying-pill">
            <span>Replying to <strong>{replyingTo.author}</strong></span>
            <button onClick={() => { setReplyingTo(null); setInputText(''); }}>✕</button>
          </div>
        )}

        {/* ── Input bar ── */}
        <div className="cp-input-bar">
          <img src={MY_AVATAR} alt="you" className="cp-av" />
          <input
            ref={inputRef}
            className="cp-input"
            value={inputText}
            onChange={e => { setInputText(e.target.value); setWarning(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={replyingTo ? `Reply to ${replyingTo.author}…` : 'Add a comment…'}
          />
          <button
            className={`cp-post-btn${inputText.trim() ? ' active' : ''}`}
            onClick={handleSubmit}
            disabled={!inputText.trim()}
          >
            Post
          </button>
        </div>

      </div>
    </div>
  );
}
