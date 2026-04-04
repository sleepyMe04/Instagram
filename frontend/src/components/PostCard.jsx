import { useState, useCallback } from 'react';
import CommentsPanel from './CommentsPanel';
import api from '../api/axios';

const MY_AVATAR = 'https://i.pravatar.cc/32?img=1';

const HeartIcon = ({ filled }) => filled ? (
  <svg fill="#ed4956" height="24" viewBox="0 0 48 48" width="24">
    <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"/>
  </svg>
) : (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const CommentBubbleIcon = () => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const RepostIcon = ({ active }) => (
  <svg fill="none" height="22" viewBox="0 0 24 24" width="22"
    stroke={active ? '#00b300' : 'currentColor'} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const BookmarkIcon = ({ saved }) => (
  <svg fill={saved ? 'currentColor' : 'none'} height="24" viewBox="0 0 24 24" width="24"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const timeAgo = (dateStr) => {
  if (!dateStr) return '2h ago';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function PostCard({ post, onRepost, onLike }) {
  const [liked,      setLiked]      = useState(false);
  const [likeCount,  setLikeCount]  = useState(post.likes || 0);
  const [saved,      setSaved]      = useState(false);
  const [heartAnim,  setHeartAnim]  = useState(false);
  const [showPanel,  setShowPanel]  = useState(false);

  // ── Lifted comment + reply state (persists across panel open/close) ──
  const [comments,   setComments]   = useState(post.comments || []);
  // repliesMap: { [commentId]: Reply[] }
  const [repliesMap, setRepliesMap] = useState({});

  const handleAddComment = useCallback((comment, fromServer = false) => {
    setComments(prev => {
      if (fromServer) {
        // avoid duplicates when server returns comments we already have locally
        const ids = new Set(prev.map(c => c._id));
        return ids.has(comment._id) ? prev : [...prev, comment];
      }
      return [...prev, comment];
    });
  }, []);

  // onAddReply(commentId, newReplies, replace?, replaceId?)
  const handleAddReply = useCallback((commentId, newReplies, replace = false, replaceId = null) => {
    setRepliesMap(prev => {
      const existing = prev[commentId] || [];
      let updated;
      if (replace) {
        // server fetch: merge server list with any local-only entries
        const serverIds = new Set(newReplies.map(r => r._id));
        const localOnly = existing.filter(r => !serverIds.has(r._id) && !r._id.startsWith('local-'));
        updated = [...newReplies, ...localOnly];
      } else if (replaceId) {
        // swap optimistic reply with confirmed server reply
        const confirmed = newReplies[0];
        updated = existing.map(r => r._id === replaceId ? confirmed : r);
      } else {
        // append (optimistic add)
        const ids = new Set(existing.map(r => r._id));
        const toAdd = newReplies.filter(r => !ids.has(r._id));
        updated = [...existing, ...toAdd];
      }
      return { ...prev, [commentId]: updated };
    });
  }, []);

  const doLike = async (forceOn) => {
    const nowLiked = forceOn !== undefined ? forceOn : !liked;
    if (forceOn === true && liked) return;
    setLiked(nowLiked);
    setLikeCount(c => nowLiked ? c + 1 : Math.max(0, c - 1));
    if (nowLiked) { setHeartAnim(true); setTimeout(() => setHeartAnim(false), 300); }
    if (onLike) onLike(post._id, nowLiked);
  };

  return (
    <>
      <article className="ig-post">
        {/* Header */}
        <div className="ig-post-header">
          <div className="ig-avatar-ring">
            <img src={`https://i.pravatar.cc/40?u=${post.author}`} alt={post.author}/>
          </div>
          <div className="ig-post-header-meta">
            <span className="ig-post-username">{post.author}</span>
            <span className="ig-post-subt">{timeAgo(post.createdAt)}</span>
          </div>
          <button className="ig-post-more">•••</button>
        </div>

        {/* Image */}
        <div className="ig-post-image-wrap">
          <img className="ig-post-image" src={post.imageUrl} alt="post"
            onDoubleClick={() => doLike(true)}/>
          {post.repostCaption !== undefined && (
            <div className="ig-repost-overlay">
              <div className="ig-repost-overlay-avatar-wrap">
                <img src={MY_AVATAR} alt="you" className="ig-repost-overlay-avatar"/>
                <div className="ig-repost-overlay-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                    <polyline points="17 1 21 5 17 9"/>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                    <polyline points="7 23 3 19 7 15"/>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="ig-actions">
          <button className={`ig-action-btn${heartAnim ? ' heart-pop' : ''}`} onClick={() => doLike()}>
            <HeartIcon filled={liked}/>
          </button>
          <button className="ig-action-btn" onClick={() => setShowPanel(true)}>
            <CommentBubbleIcon/>
          </button>
          <button className="ig-action-btn" onClick={() => onRepost(post)} title="Repost">
            <RepostIcon active={post.repostCaption !== undefined}/>
          </button>
          <button className="ig-action-btn ig-bookmark" onClick={() => setSaved(s => !s)}>
            <BookmarkIcon saved={saved}/>
          </button>
        </div>

        <div className="ig-post-likes">{likeCount.toLocaleString()} likes</div>

        <div className="ig-post-caption">
          <span className="ig-caption-user">{post.author}</span>{post.caption}
        </div>

        {comments.length > 0 && (
          <button className="ig-view-all-comments" onClick={() => setShowPanel(true)}>
            View all {comments.length} comments
          </button>
        )}

        <div className="ig-post-time">{timeAgo(post.createdAt)}</div>

        {/* Inline bar — opens panel */}
        <div className="ig-add-comment-bar" onClick={() => setShowPanel(true)} style={{ cursor: 'pointer' }}>
          <div className="ig-comment-bar-avatar">
            <img src={MY_AVATAR} alt="you"/>
          </div>
          <div className="ig-comment-input ig-comment-input-placeholder">
            Add a comment…
          </div>
        </div>
      </article>

      {showPanel && (
        <CommentsPanel
          post={post}
          comments={comments}
          repliesMap={repliesMap}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  );
}
