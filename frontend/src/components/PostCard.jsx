import { useState, useCallback, useEffect } from 'react';
import CommentsPanel from './CommentsPanel';
import LikesModal from './LikesModal';
import RepostModal from './RepostModal';
import api from '../api/axios';

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
    stroke={active ? '#a855f7' : 'currentColor'} strokeWidth="2"
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

export default function PostCard({ post, currentUser, onRepost, onLike }) {
  // Viewer avatar
  const images = post.images?.length ? post.images : [post.imageUrl];
  const myAvatar = currentUser?.avatarUrl || 'https://i.pravatar.cc/32?u=_mld_';
  const [activeImage, setActiveImage] = useState(0);
  const [liked,       setLiked]      = useState(Boolean(post.viewerHasLiked));
  const [likeCount,   setLikeCount]  = useState(post.likes || 0);
  const [saved,       setSaved]      = useState(false);
  const [heartAnim,   setHeartAnim]  = useState(false);
  const [showLikes,   setShowLikes]  = useState(false);
  const [showPanel,   setShowPanel]  = useState(false);

  // ── Repost state ──────────────────────────────────────────────────────
  // repostCaption: undefined = not reposted, string (even '') = reposted
  const [repostCaption, setRepostCaption] = useState(
    post.repostCaption !== undefined ? post.repostCaption : undefined
  );
  const isReposted = repostCaption !== undefined;
  const [showCaptionModal, setShowCaptionModal] = useState(false);

  // ── Lifted comment + reply state ──────────────────────────────────────
  const [comments,   setComments]   = useState(post.comments || []);
  const [repliesMap, setRepliesMap] = useState({});

  useEffect(() => {
    setActiveImage(0);
  }, [post._id]);

  useEffect(() => {
    setLikeCount(post.likes || 0);
  }, [post._id, post.likes]);

  useEffect(() => {
    // Server state
    setLiked(Boolean(post.viewerHasLiked));
    setRepostCaption(post.repostCaption !== undefined ? post.repostCaption : undefined);
  }, [post._id, post.viewerHasLiked, post.repostCaption]);

  const handleAddComment = useCallback((comment, fromServer = false) => {
    setComments(prev => {
      if (fromServer) {
        const ids = new Set(prev.map(c => c._id));
        return ids.has(comment._id) ? prev : [...prev, comment];
      }
      return [...prev, comment];
    });
  }, []);

  const handleAddReply = useCallback((commentId, newReplies, replace = false, replaceId = null) => {
    setRepliesMap(prev => {
      const existing = prev[commentId] || [];
      let updated;
      if (replace) {
        const serverIds = new Set(newReplies.map(r => r._id));
        const localOnly = existing.filter(r => !serverIds.has(r._id) && !r._id.startsWith('local-'));
        updated = [...newReplies, ...localOnly];
      } else if (replaceId) {
        const confirmed = newReplies[0];
        updated = existing.map(r => r._id === replaceId ? confirmed : r);
      } else {
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
    // Optimistic like
    setLiked(nowLiked);
    setLikeCount(c => nowLiked ? c + 1 : Math.max(0, c - 1));
    if (nowLiked) { setHeartAnim(true); setTimeout(() => setHeartAnim(false), 300); }
    if (onLike) onLike(post._id, nowLiked);
  };

  // ── Repost handlers ───────────────────────────────────────────────────
  const handleRepostClick = async () => {
    if (isReposted) {
      // already reposted — clicking icon again opens the caption modal
      setShowCaptionModal(true);
      return;
    }
    // Start repost
    setRepostCaption('');
    try {
      await api.put(`/posts/${post._id}/repost`, {
        reposted: true,
        userId: currentUser?._id,
        caption: ''
      });
    } catch (err) {
      console.error('Repost failed:', err);
    }
  };

  const handleTagFriendClick = () => {
    // "Tag a friend…" bar clicked — open caption modal
    setShowCaptionModal(true);
  };

  const handleCaptionConfirm = (caption) => {
    // Save caption
    setRepostCaption(caption);
    setShowCaptionModal(false);
    api.put(`/posts/${post._id}/repost`, {
      reposted: true,
      userId: currentUser?._id,
      caption
    }).catch(err => {
      console.error('Repost caption save failed:', err);
    });
  };

  const handleDelete = () => {
    // Remove repost
    setRepostCaption(undefined);
    setShowCaptionModal(false);
    api.put(`/posts/${post._id}/repost`, {
      reposted: false,
      userId: currentUser?._id
    }).catch(err => {
      console.error('Remove repost failed:', err);
    });
  };

  const showCarouselControls = images.length > 1;
  const currentImage = images[activeImage] || post.imageUrl;
  const goToPrevImage = () => {
    setActiveImage(index => (index - 1 + images.length) % images.length);
  };
  const goToNextImage = () => {
    setActiveImage(index => (index + 1) % images.length);
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
          <img className="ig-post-image" src={currentImage} alt="post"
            onDoubleClick={() => doLike(true)}/>

          {showCarouselControls && (
            <>
              <div className="ig-post-carousel-badge">
                {activeImage + 1}/{images.length}
              </div>
              <button
                type="button"
                className="ig-post-carousel-btn ig-post-carousel-btn-left"
                onClick={goToPrevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className="ig-post-carousel-btn ig-post-carousel-btn-right"
                onClick={goToNextImage}
                aria-label="Next image"
              >
                ›
              </button>
              <div className="ig-post-carousel-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`ig-post-carousel-dot${index === activeImage ? ' active' : ''}`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Repost overlay — shown immediately after reposting */}
          {isReposted && (
            <div className="ig-repost-overlay" onClick={handleTagFriendClick}>
              {/* "Tag a friend…" or caption — above the avatar pill */}
              <span className="ig-repost-overlay-caption">
                {repostCaption ? repostCaption : 'Tag a friend…'}
              </span>
              {/* Avatar + repost badge pill */}
              <div className="ig-repost-overlay-avatar-pill">
                <div className="ig-repost-overlay-avatar-wrap">
                  <img src={myAvatar} alt="you" className="ig-repost-overlay-avatar"/>
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
          <button className="ig-action-btn" onClick={handleRepostClick} title="Repost">
            <RepostIcon active={isReposted}/>
          </button>
          <button className="ig-action-btn ig-bookmark" onClick={() => setSaved(s => !s)}>
            <BookmarkIcon saved={saved}/>
          </button>
        </div>

        <button
          type="button"
          className="ig-post-likes ig-post-likes-btn"
          onClick={() => setShowLikes(true)}
        >
          {likeCount.toLocaleString()} likes
        </button>

        <div className="ig-post-caption">
          <span className="ig-caption-user">{post.author}</span>{post.caption}
        </div>

        {comments.length > 0 && (
          <button className="ig-view-all-comments" onClick={() => setShowPanel(true)}>
            View all {comments.length} comments
          </button>
        )}

        <div className="ig-post-time">{timeAgo(post.createdAt)}</div>

        {/* Inline comment bar — opens CommentsPanel */}
        <div className="ig-add-comment-bar" onClick={() => setShowPanel(true)} style={{ cursor: 'pointer' }}>
          <div className="ig-comment-bar-avatar">
            <img src={myAvatar} alt="you"/>
          </div>
          <div className="ig-comment-input ig-comment-input-placeholder">
            Add a comment…
          </div>
        </div>
      </article>

      {/* Comments panel */}
      {showPanel && (
        <CommentsPanel
          post={post}
          currentUser={currentUser}
          comments={comments}
          repliesMap={repliesMap}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          onClose={() => setShowPanel(false)}
        />
      )}

      {showLikes && (
        <LikesModal
          postId={post._id}
          initialCount={likeCount}
          onClose={() => setShowLikes(false)}
        />
      )}

      {/* Caption modal — only opens when "Tag a friend…" is clicked */}
      {showCaptionModal && (
        <RepostModal
          post={post}
          existingCaption={repostCaption || ''}
          onConfirm={handleCaptionConfirm}
          onDelete={handleDelete}
          onCancel={() => setShowCaptionModal(false)}
        />
      )}
    </>
  );
}
