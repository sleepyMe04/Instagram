import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const HeartIcon = ({ filled }) => filled ? (
  <svg fill="#ed4956" height="18" viewBox="0 0 48 48" width="18">
    <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"/>
  </svg>
) : (
  <svg fill="none" height="18" viewBox="0 0 24 24" width="18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

function ReactionButton({ liked, likeCount, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: liked ? '#ed4956' : 'var(--text-muted)',
        padding: '2px 0 0',
        fontFamily: 'inherit',
        flexShrink: 0,
      }}
    >
      <HeartIcon filled={liked} />
      {likeCount > 0 && (
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'inherit',
            minWidth: '10px',
            textAlign: 'left',
          }}
        >
          {likeCount}
        </span>
      )}
    </button>
  );
}

// ── Single reply row ──────────────────────────────────────────────────────────
function ReplyRow({ reply, myAvatar, currentUsername }) {
  const [liked, setLiked] = useState(Boolean(reply.viewerHasLiked));
  const [likeCount, setLikeCount] = useState(reply.likes || 0);
  const avatar = reply.author === currentUsername || reply.author === 'you'
    ? myAvatar
    : `https://i.pravatar.cc/28?u=${reply.author}`;

  useEffect(() => {
    setLiked(Boolean(reply.viewerHasLiked));
    setLikeCount(reply.likes || 0);
  }, [reply._id, reply.likes, reply.viewerHasLiked]);

  const handleLikeToggle = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount(count => next ? count + 1 : Math.max(0, count - 1));
  };

  return (
    <div className="cp-reply-row">
      <img src={avatar} alt={reply.author} className="cp-av cp-av-sm" />
      <div className="cp-reply-body" style={{ flex: 1, minWidth: 0 }}>
        <span className="cp-uname">{reply.author}</span>{' '}{reply.text}
      </div>
      <div style={{ marginLeft: 'auto', paddingLeft: '12px' }}>
        <ReactionButton
          liked={liked}
          likeCount={likeCount}
          onToggle={handleLikeToggle}
          label={liked ? 'Unlike reply' : 'Like reply'}
        />
      </div>
    </div>
  );
}

// ── Single top-level comment + its threaded replies ───────────────────────────
function CommentThread({ comment, postId, replies, onAddReply, onReplyTo, myAvatar, currentUsername }) {
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [fetched, setFetched]         = useState(false);
  const [liked, setLiked]             = useState(Boolean(comment.viewerHasLiked));
  const [likeCount, setLikeCount]     = useState(comment.likes || 0);

  const avatar = comment.author === currentUsername || comment.author === 'you'
    ? myAvatar
    : `https://i.pravatar.cc/36?u=${comment.author}`;

  useEffect(() => {
    setLiked(Boolean(comment.viewerHasLiked));
    setLikeCount(comment.likes || 0);
  }, [comment._id, comment.likes, comment.viewerHasLiked]);

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
  const handleLikeToggle = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount(count => next ? count + 1 : Math.max(0, count - 1));
  };

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
        <ReactionButton
          liked={liked}
          likeCount={likeCount}
          onToggle={handleLikeToggle}
          label={liked ? 'Unlike comment' : 'Like comment'}
        />
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
          {replies.map(r => (
            <ReplyRow
              key={r._id}
              reply={r}
              myAvatar={myAvatar}
              currentUsername={currentUsername}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── CommentsPanel ─────────────────────────────────────────────────────────────
export default function CommentsPanel({
  post,
  currentUser,
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
  // Viewer avatar
  const currentUsername = currentUser?.username || '_sleepy_123';
  const myAvatar = currentUser?.avatarUrl || 'https://i.pravatar.cc/32?u=_sleepy_123';

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
    setWarning('');

    if (replyingTo) {
      try {
        const replyTarget = replyingTo;
        const res = await api.post(`/comments/${post._id}`, {
          author: currentUsername, text, parentCommentId: replyTarget._id,
        });
        onAddReply(replyTarget._id, [res.data]);
        setReplyingTo(null);
        setInputText('');
      } catch (err) {
        if (err.response?.data?.warning) setWarning(err.response.data.message);
      }
    } else {
      try {
        const res = await api.post(`/comments/${post._id}`, { author: currentUsername, text });
        onAddComment(res.data);
        setInputText('');
        setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 80);
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
                myAvatar={myAvatar}
                currentUsername={currentUsername}
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
          <img src={myAvatar} alt="you" className="cp-av" />
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
