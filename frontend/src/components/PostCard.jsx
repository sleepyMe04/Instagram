import { useState } from 'react';

// ── Icons ──────────────────────────────────────────────────────────────────

const HeartIcon = ({ filled }) => filled ? (
  <svg fill="#ed4956" height="24" viewBox="0 0 48 48" width="24">
    <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z" />
  </svg>
) : (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" stroke="#262626" strokeWidth="2" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// ── PostCard ───────────────────────────────────────────────────────────────

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [heartAnim, setHeartAnim] = useState(false);

  const doLike = (forceOn) => {
    const nowLiked = forceOn !== undefined ? forceOn : !liked;
    if (forceOn === true && liked) return;
    setLiked(nowLiked);
    setLikeCount(c => nowLiked ? c + 1 : c - 1);
    if (nowLiked) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 300);
    }
  };

  return (
    <article className="ig-post">

      {/* ── Post header ── */}
      <div className="ig-post-header">
        <div className="ig-avatar-ring">
          <img src={`https://i.pravatar.cc/40?u=${post.author}`} alt={post.author} />
        </div>
        <div className="ig-post-header-meta">
          <span className="ig-post-username">{post.author}</span>
          <span className="ig-post-subt">New York, USA</span>
        </div>
        <button className="ig-post-more">•••</button>
      </div>

      {/* ── Image (double-tap to like) ── */}
      <div className="ig-post-image-wrap">
        <img
          className="ig-post-image"
          src={post.imageUrl}
          alt="post"
          onDoubleClick={() => doLike(true)}
        />
        {/* Repost overlay — shown only on reposted posts */}
        {post.repostCaption !== undefined && (
          <div className="ig-repost-overlay">
            <div className="ig-repost-overlay-avatar-wrap">
              <img
                src="https://i.pravatar.cc/40?img=1"
                alt="you"
                className="ig-repost-overlay-avatar"
              />
              <div className="ig-repost-overlay-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div className="ig-actions">
        <button
          className={`ig-action-btn${heartAnim ? ' heart-pop' : ''}`}
          onClick={() => doLike()}
        >
          <HeartIcon filled={liked} />
        </button>
        
        {/* Repost — opens the RepostModal via onRepost prop */}
        <button
          className="ig-action-btn"
          onClick={() => onRepost(post)}
          title="Repost"
        >
          <RepostIcon active={post.repostCaption !== undefined} />
        </button>

        {/* Bookmark */}
        <button className="ig-action-btn ig-bookmark" onClick={() => setSaved(s => !s)}>
          <BookmarkIcon saved={saved} />
        </button>
      </div>
      

      {/* ── Likes count ── */}
      <div className="ig-post-likes">{likeCount.toLocaleString()} likes</div>

      {/* ── Caption ── */}
      <div className="ig-post-caption">
        <span className="ig-caption-user">{post.author}</span>
        {post.caption}
      </div>

      <div className="ig-post-time">2 hours ago</div>

      

    </article>
  );
}